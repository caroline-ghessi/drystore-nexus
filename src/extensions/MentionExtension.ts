import { Node, mergeAttributes } from '@tiptap/core'
import { ReactRenderer } from '@tiptap/react'
import Suggestion from '@tiptap/suggestion'
import { MentionList, MentionListRef } from '@/components/chat/MentionList'

interface MentionUser {
  user_id: string
  display_name: string | null
  avatar_url: string | null
}

export interface MentionOptions {
  HTMLAttributes: Record<string, any>
  suggestion: {
    items: (props: { query: string; editor: any }) => MentionUser[]
    render: () => {
      onStart: (props: any) => void
      onUpdate: (props: any) => void
      onKeyDown: (props: any) => boolean
      onExit: () => void
    }
  }
}

export const Mention = Node.create<MentionOptions>({
  name: 'mention',

  group: 'inline',

  inline: true,

  selectable: false,

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      suggestion: {
        char: '@',
        startOfLine: false,
        allowSpaces: false,
        items: () => [],
        render: () => ({
          onStart: () => {},
          onUpdate: () => {},
          onKeyDown: () => false,
          onExit: () => {},
        }),
      },
    }
  },

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-id'),
        renderHTML: attributes => {
          if (!attributes.id) {
            return {}
          }
          return {
            'data-id': attributes.id,
          }
        },
      },
      label: {
        default: null,
        parseHTML: element => element.getAttribute('data-label'),
        renderHTML: attributes => {
          if (!attributes.label) {
            return {}
          }
          return {
            'data-label': attributes.label,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="mention"]',
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(
        { 'data-type': 'mention' },
        this.options.HTMLAttributes,
        HTMLAttributes,
        {
          class: 'mention bg-primary/10 text-primary px-1 rounded',
        }
      ),
      `@${node.attrs.label ?? node.attrs.id}`,
    ]
  },

  renderText({ node }) {
    return `@${node.attrs.label ?? node.attrs.id}`
  },

  addKeyboardShortcuts() {
    return {
      Backspace: () =>
        this.editor.commands.command(({ tr, state }) => {
          let isMention = false
          const { selection } = state
          const { empty, anchor } = selection

          if (!empty) {
            return false
          }

          state.doc.nodesBetween(anchor - 1, anchor, (node, pos) => {
            if (node.type.name === this.name) {
              isMention = true
              tr.insertText('', pos, pos + node.nodeSize)
              return false
            }
          })

          return isMention
        }),
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})

export function createMentionSuggestion(searchMembers: (query: string) => MentionUser[]) {
  return {
    items: ({ query }: { query: string; editor: any }) => {
      console.log('Buscando membros com query:', query)
      const results = searchMembers(query).slice(0, 10)
      console.log('Resultados encontrados:', results)
      return results
    },

    render: () => {
      let component: ReactRenderer<MentionListRef>
      let popup: any

      return {
        onStart: (props: any) => {
          component = new ReactRenderer(MentionList, {
            props: {
              ...props,
              command: (item: MentionUser) => {
                console.log('Command iniciado para usuário:', item.display_name, 'ID:', item.user_id)
                try {
                  const result = props.command({
                    id: item.user_id,
                    label: item.display_name || 'Usuário'
                  })
                  console.log('Command executado com sucesso, resultado:', result)
                  
                  // Fechar o popup após inserir a menção
                  if (popup) {
                    popup.hide()
                    console.log('Popup fechado após inserção da menção')
                  }
                } catch (error) {
                  console.error('Erro ao executar command:', error)
                }
              }
            },
            editor: props.editor,
          })

          if (!props.clientRect) {
            return
          }

          // Importar tippy dinamicamente se não estiver disponível
          if (typeof (window as any).tippy !== 'function') {
            import('tippy.js').then((tippy) => {
              (window as any).tippy = tippy.default || tippy
              createPopup()
            }).catch(() => {
              console.warn('Tippy.js não pôde ser carregado, menções não funcionarão')
            })
            return
          }

          createPopup()

          function createPopup() {
            popup = (window as any).tippy('body', {
              getReferenceClientRect: props.clientRect,
              appendTo: () => document.body,
              content: component.element,
              showOnCreate: true,
              interactive: true,
              trigger: 'manual',
              placement: 'bottom-start',
              arrow: false,
              theme: 'light-border',
              maxWidth: 'none',
            })
          }
        },

        onUpdate(props: any) {
          component.updateProps(props)

          if (!props.clientRect || !popup) {
            return
          }

          popup[0].setProps({
            getReferenceClientRect: props.clientRect,
          })
        },

        onKeyDown(props: any) {
          if (props.event.key === 'Escape') {
            if (popup && popup[0]) {
              popup[0].hide()
            }
            return true
          }

          return component.ref?.onKeyDown(props.event) || false
        },

        onExit() {
          if (popup && popup[0]) {
            popup[0].destroy()
          }
          component.destroy()
        },
      }
    },
  }
}