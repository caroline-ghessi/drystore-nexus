import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verificar se o usuário é admin
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: adminCheck } = await supabaseClient.rpc('is_current_user_admin');
    if (!adminCheck) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { channelId, startDate, endDate, format = 'json' } = await req.json();

    // Buscar mensagens do canal
    let query = supabaseClient
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        edited,
        attachments,
        profiles!inner(display_name)
      `)
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true });

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data: messages, error } = await query;

    if (error) throw error;

    // Buscar informações do canal
    const { data: channel } = await supabaseClient
      .from('channels')
      .select('name')
      .eq('id', channelId)
      .single();

    const exportData = {
      channel: channel?.name || 'Unknown',
      exportDate: new Date().toISOString(),
      messageCount: messages?.length || 0,
      dateRange: { startDate, endDate },
      messages: messages?.map(msg => ({
        author: msg.profiles?.display_name || 'Unknown User',
        content: msg.content,
        timestamp: msg.created_at,
        edited: msg.edited || false,
        attachments: msg.attachments || []
      })) || []
    };

    if (format === 'csv') {
      const csvHeaders = 'Author,Content,Timestamp,Edited,Attachments\n';
      const csvRows = exportData.messages.map(msg => 
        `"${msg.author}","${msg.content.replace(/"/g, '""')}","${msg.timestamp}","${msg.edited}","${JSON.stringify(msg.attachments).replace(/"/g, '""')}"`
      ).join('\n');
      
      return new Response(csvHeaders + csvRows, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="channel-${channel?.name || 'export'}-${new Date().toISOString().split('T')[0]}.csv"`
        },
      });
    }

    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="channel-${channel?.name || 'export'}-${new Date().toISOString().split('T')[0]}.json"`
      },
    });

  } catch (error) {
    console.error('Error in export-conversations function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});