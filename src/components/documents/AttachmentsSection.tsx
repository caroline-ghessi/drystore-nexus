import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { 
  Upload, 
  Download, 
  Trash2, 
  FileText, 
  Image, 
  FileArchive, 
  File,
  Loader2 
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface AttachmentsProps {
  documentId: string
  canEdit: boolean
}

interface Attachment {
  name: string
  size: number
  created_at: string
  id: string
}

const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileIcon = (fileName: string) => {
  const ext = fileName.toLowerCase().split('.').pop()
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
    return <Image className="h-4 w-4" />
  }
  if (['zip', 'rar', '7z', 'tar'].includes(ext || '')) {
    return <FileArchive className="h-4 w-4" />
  }
  if (['pdf', 'doc', 'docx', 'txt'].includes(ext || '')) {
    return <FileText className="h-4 w-4" />
  }
  return <File className="h-4 w-4" />
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function AttachmentsSection({ documentId, canEdit }: AttachmentsProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadAttachments()
  }, [documentId])

  const loadAttachments = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.storage
        .from('document_attachments')
        .list(`documents/${documentId}`)

      if (error) throw error

      const attachmentsData: Attachment[] = (data || [])
        .filter(file => file.name !== '.emptyFolderPlaceholder')
        .map(file => ({
          name: file.name,
          size: file.metadata?.size || 0,
          created_at: file.created_at || new Date().toISOString(),
          id: file.id || file.name
        }))

      setAttachments(attachmentsData)
    } catch (error: any) {
      console.error('Error loading attachments:', error)
      toast({
        title: "Erro ao carregar anexos",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validação de tamanho
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Arquivo muito grande",
        description: `O arquivo deve ter no máximo ${formatFileSize(MAX_FILE_SIZE)}.`,
        variant: "destructive",
      })
      return
    }

    // Validação de tipo
    const allowedTypes = [
      '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
      '.zip', '.rar', '.7z', '.txt', '.png', '.jpg', '.jpeg', '.gif', '.webp'
    ]
    const fileExt = '.' + file.name.toLowerCase().split('.').pop()
    if (!allowedTypes.includes(fileExt)) {
      toast({
        title: "Tipo de arquivo não permitido",
        description: "Tipos permitidos: PDF, DOC, XLS, PPT, ZIP, TXT, PNG, JPG",
        variant: "destructive",
      })
      return
    }

    try {
      setUploading(true)
      
      // Sanitizar nome do arquivo
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const fileName = `documents/${documentId}/${Date.now()}_${sanitizedName}`

      const { error } = await supabase.storage
        .from('document_attachments')
        .upload(fileName, file)

      if (error) throw error

      toast({
        title: "Arquivo enviado!",
        description: `${file.name} foi anexado com sucesso.`,
      })

      loadAttachments() // Recarregar lista
    } catch (error: any) {
      console.error('Error uploading file:', error)
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      // Limpar input
      event.target.value = ''
    }
  }

  const handleDownload = async (fileName: string) => {
    try {
      const filePath = `documents/${documentId}/${fileName}`
      const { data, error } = await supabase.storage
        .from('document_attachments')
        .createSignedUrl(filePath, 60) // URL válida por 1 minuto

      if (error) throw error

      if (data?.signedUrl) {
        // Criar link temporário para download
        const link = document.createElement('a')
        link.href = data.signedUrl
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error: any) {
      console.error('Error downloading file:', error)
      toast({
        title: "Erro no download",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (fileName: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${fileName}"?`)) return

    try {
      setDeleting(fileName)
      const filePath = `documents/${documentId}/${fileName}`
      
      const { error } = await supabase.storage
        .from('document_attachments')
        .remove([filePath])

      if (error) throw error

      toast({
        title: "Arquivo excluído",
        description: `${fileName} foi removido com sucesso.`,
      })

      loadAttachments() // Recarregar lista
    } catch (error: any) {
      console.error('Error deleting file:', error)
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setDeleting(null)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Anexos</CardTitle>
        {canEdit && (
          <div className="relative">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z,.txt,.png,.jpg,.jpeg,.gif,.webp"
            />
            <Button
              size="sm"
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Enviar arquivo
                </>
              )}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-4 w-4" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        ) : attachments.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum anexo encontrado</p>
            {canEdit && (
              <p className="text-sm text-muted-foreground mt-2">
                Use o botão "Enviar arquivo" para adicionar anexos
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(attachment.name)}
                  <div>
                    <p className="font-medium text-sm">{attachment.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(attachment.size)} • {formatDate(attachment.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(attachment.name)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {canEdit && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(attachment.name)}
                      disabled={deleting === attachment.name}
                      className="text-destructive hover:text-destructive"
                    >
                      {deleting === attachment.name ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}