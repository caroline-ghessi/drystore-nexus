import { useState, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Mention, createMentionSuggestion } from '@/extensions/MentionExtension'
import { useChannelMembers } from '@/hooks/useChannelMembers'
import { useReplies } from '@/hooks/useReplies'
import { ReplyPreview } from './ReplyPreview'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Bold, Italic, Paperclip, Smile, Send } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import EmojiPicker from 'emoji-picker-react'
import { cn } from '@/lib/utils'

interface MessageRichEditorProps {
  onSendMessage: (content: string, attachments?: any[], replyToId?: string, mentions?: any[]) => void
  placeholder?: string
  className?: string
  channelId: string
}

interface Attachment {
  id: string
  name: string
  size: number
  url: string
  type: string
}

export function MessageRichEditor({ 
  onSendMessage, 
  placeholder = "Digite sua mensagem...",
  className,
  channelId
}: MessageRichEditorProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [uploading, setUploading] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  
  const { members, searchMembers } = useChannelMembers(channelId)
  const { replyTo, cancelReply, clearReply } = useReplies()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        listItem: false,
        orderedList: false,
        bulletList: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Mention.configure({
        suggestion: createMentionSuggestion(searchMembers),
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[40px] max-h-[200px] overflow-y-auto p-3 text-sm',
      },
    },
  })

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const uploadedAttachments: Attachment[] = []

    try {
      for (const file of Array.from(files)) {
        // Validate file size (10MB max for messages)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "Arquivo muito grande",
            description: `${file.name} excede o limite de 10MB.`,
            variant: "destructive",
          })
          continue
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `temp/${fileName}` // Will be moved after message is created

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('message_attachments')
          .upload(filePath, file)

        if (error) throw error

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('message_attachments')
          .getPublicUrl(filePath)

        uploadedAttachments.push({
          id: fileName,
          name: file.name,
          size: file.size,
          url: publicUrl,
          type: file.type,
        })
      }

      setAttachments(prev => [...prev, ...uploadedAttachments])
      toast({
        title: "Arquivos enviados",
        description: `${uploadedAttachments.length} arquivo(s) adicionado(s).`,
      })
    } catch (error) {
      console.error('Error uploading files:', error)
      toast({
        title: "Erro ao enviar arquivo",
        description: "Não foi possível enviar o arquivo. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeAttachment = async (attachmentId: string) => {
    try {
      // Remove from storage
      const attachment = attachments.find(a => a.id === attachmentId)
      if (attachment) {
        await supabase.storage
          .from('message_attachments')
          .remove([`temp/${attachmentId}`])
      }

      // Remove from state
      setAttachments(prev => prev.filter(a => a.id !== attachmentId))
    } catch (error) {
      console.error('Error removing attachment:', error)
    }
  }

  const handleSend = () => {
    if (!editor) return

    const content = editor.getHTML()
    const textContent = editor.getText().trim()

    // Don't send empty messages unless there are attachments
    if (!textContent && attachments.length === 0) return

    // Extract mentions from editor content
    const mentions: any[] = []
    editor.state.doc.descendants((node) => {
      if (node.type.name === 'mention') {
        const member = members.find(m => m.user_id === node.attrs.id)
        if (member) {
          mentions.push({
            user_id: member.user_id,
            display_name: member.display_name
          })
        }
      }
    })

    // Send message with content, attachments, reply and mentions
    onSendMessage(content, attachments, replyTo?.id, mentions)

    // Clear editor and attachments
    editor.commands.clearContent()
    setAttachments([])
    clearReply()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  const addEmoji = (emojiData: any) => {
    if (editor) {
      editor.chain().focus().insertContent(emojiData.emoji).run()
    }
    setShowEmojiPicker(false)
  }

  if (!editor) return null

  return (
    <div className={cn("border rounded-lg bg-background", className)}>
      {/* Reply Preview */}
      {replyTo && (
        <ReplyPreview message={replyTo} onCancel={cancelReply} />
      )}
      
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="border-b p-2 space-y-1">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="flex items-center gap-2 text-xs bg-muted p-2 rounded">
              <Paperclip className="w-3 h-3" />
              <span className="flex-1 truncate">{attachment.name}</span>
              <span className="text-muted-foreground">{formatFileSize(attachment.size)}</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-4 w-4 p-0"
                onClick={() => removeAttachment(attachment.id)}
              >
                ×
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Editor */}
      <div onKeyDown={handleKeyDown}>
        <EditorContent editor={editor} />
      </div>

      {/* Toolbar */}
      <div className="border-t p-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {/* Text Formatting */}
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={() => editor.chain().focus().toggleBold().run()}
            data-active={editor.isActive('bold')}
          >
            <Bold className="w-3 h-3" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            data-active={editor.isActive('italic')}
          >
            <Italic className="w-3 h-3" />
          </Button>

          {/* File Attachment */}
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Paperclip className="w-3 h-3" />
          </Button>

          {/* Emoji Picker */}
          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
              >
                <Smile className="w-3 h-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" side="top">
              <EmojiPicker onEmojiClick={addEmoji} width={300} height={400} />
            </PopoverContent>
          </Popover>
        </div>

        {/* Send Button */}
        <Button
          size="sm"
          onClick={handleSend}
          disabled={!editor.getText().trim() && attachments.length === 0}
        >
          <Send className="w-3 h-3" />
        </Button>
      </div>

      {/* Hidden File Input */}
      <Input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileUpload}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt,.png,.jpg,.jpeg,.gif,.webp,.mp4,.mov,.avi"
      />
    </div>
  )
}