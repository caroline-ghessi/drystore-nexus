import { create } from 'zustand'

interface ReplyMessage {
  id: string
  content: string
  user_id: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
}

interface ReplyStore {
  replyTo: ReplyMessage | null
  startReply: (message: ReplyMessage) => void
  cancelReply: () => void
  clearReply: () => void
  isReplying: boolean
}

export const useReplies = create<ReplyStore>((set, get) => ({
  replyTo: null,
  isReplying: false,
  
  startReply: (message: ReplyMessage) => {
    set({ replyTo: message, isReplying: true })
  },
  
  cancelReply: () => {
    set({ replyTo: null, isReplying: false })
  },
  
  clearReply: () => {
    set({ replyTo: null, isReplying: false })
  }
}))