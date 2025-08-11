import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface ReadStatus {
  isRead: boolean;
  isConfirmed?: boolean;
  readAt?: string;
  confirmedAt?: string;
}

export function useReadTracking() {
  const { user } = useAuth();

  const markAnnouncementRead = async (announcementId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('mark_announcement_read', {
        announcement_id: announcementId
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error marking announcement as read:', error);
    }
  };

  const markDocumentRead = async (documentId: string, confirmed: boolean = false) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('mark_document_read', {
        document_id: documentId,
        confirmed: confirmed
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error marking document as read:', error);
    }
  };

  const getAnnouncementReadStatus = async (announcementId: string): Promise<ReadStatus> => {
    if (!user) return { isRead: false };

    try {
      const { data, error } = await supabase
        .from('announcement_reads')
        .select('read_at')
        .eq('announcement_id', announcementId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      return {
        isRead: !!data,
        readAt: data?.read_at
      };
    } catch (error) {
      console.error('Error getting announcement read status:', error);
      return { isRead: false };
    }
  };

  const getDocumentReadStatus = async (documentId: string): Promise<ReadStatus> => {
    if (!user) return { isRead: false };

    try {
      const { data, error } = await supabase
        .from('document_reads')
        .select('read_at, confirmed_read, confirmed_at')
        .eq('document_id', documentId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      return {
        isRead: !!data,
        isConfirmed: data?.confirmed_read || false,
        readAt: data?.read_at,
        confirmedAt: data?.confirmed_at
      };
    } catch (error) {
      console.error('Error getting document read status:', error);
      return { isRead: false };
    }
  };

  return {
    markAnnouncementRead,
    markDocumentRead,
    getAnnouncementReadStatus,
    getDocumentReadStatus
  };
}