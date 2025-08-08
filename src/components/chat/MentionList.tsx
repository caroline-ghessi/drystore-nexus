import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface MentionUser {
  user_id: string
  display_name: string | null
  avatar_url: string | null
}

export interface MentionListRef {
  onKeyDown: (event: KeyboardEvent) => boolean
}

interface MentionListProps {
  items: MentionUser[]
  command: (item: MentionUser) => void
}

export const MentionList = forwardRef<MentionListRef, MentionListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    useEffect(() => {
      setSelectedIndex(0)
    }, [items])

    const selectItem = (index: number) => {
      const item = items[index]
      if (item) {
        command(item)
      }
    }

    useImperativeHandle(ref, () => ({
      onKeyDown: (event: KeyboardEvent) => {
        if (event.key === 'ArrowUp') {
          setSelectedIndex((selectedIndex + items.length - 1) % items.length)
          return true
        }

        if (event.key === 'ArrowDown') {
          setSelectedIndex((selectedIndex + 1) % items.length)
          return true
        }

        if (event.key === 'Enter') {
          selectItem(selectedIndex)
          return true
        }

        return false
      },
    }))

    if (items.length === 0) {
      return (
        <div className="bg-popover border rounded-lg shadow-md p-2 max-w-xs">
          <div className="text-sm text-muted-foreground px-2 py-1">
            Nenhum usuário encontrado
          </div>
        </div>
      )
    }

    return (
      <div className="bg-popover border rounded-lg shadow-md p-1 max-w-xs max-h-48 overflow-y-auto">
        {items.map((item, index) => (
          <button
            key={item.user_id}
            className={`w-full flex items-center gap-2 px-2 py-2 text-left rounded-md text-sm transition-colors ${
              index === selectedIndex
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-accent hover:text-accent-foreground'
            }`}
            onClick={() => selectItem(index)}
          >
            <Avatar className="w-6 h-6">
              <AvatarImage src={item.avatar_url || undefined} />
              <AvatarFallback className="text-xs">
                {(item.display_name || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">
              {item.display_name || 'Usuário'}
            </span>
          </button>
        ))}
      </div>
    )
  }
)

MentionList.displayName = 'MentionList'