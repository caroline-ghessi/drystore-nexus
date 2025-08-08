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
      return searchMembers(query).slice(0, 10)
    },

    render: () => {
      let component: ReactRenderer<MentionListRef>
      let popup: any

      return {
        onStart: (props: any) => {
          component = new ReactRenderer(MentionList, {
            props,
            editor: props.editor,
          })

          if (!props.clientRect) {
            return
          }

          popup = (window as any).tippy('body', {
            getReferenceClientRect: props.clientRect,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'bottom-start',
          })
        },

        onUpdate(props: any) {
          component.updateProps(props)

          if (!props.clientRect) {
            return
          }

          popup[0].setProps({
            getReferenceClientRect: props.clientRect,
          })
        },

        onKeyDown(props: any) {
          if (props.event.key === 'Escape') {
            popup[0].hide()
            return true
          }

          return component.ref?.onKeyDown(props.event) || false
        },

        onExit() {
          popup[0].destroy()
          component.destroy()
        },
      }
    },
  }
}