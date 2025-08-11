import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  email: string;
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify user is admin
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        global: {
          headers: { authorization: authHeader },
        },
      }
    );

    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user is admin
    const { data: isAdmin } = await supabase.rpc('is_current_user_admin');
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email, message }: InvitationRequest = await req.json();

    // Check if user already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    if (existingProfile) {
      return new Response(JSON.stringify({ error: "Usuário já existe no sistema" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if invitation already exists
    const { data: existingInvitation } = await supabase
      .from('invitations')
      .select('id, status')
      .eq('email', email)
      .in('status', ['pending', 'sent'])
      .single();

    if (existingInvitation) {
      return new Response(JSON.stringify({ error: "Convite já enviado para este email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate invitation token
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    // Create invitation record
    const { data: invitation, error: inviteError } = await supabase
      .from('invitations')
      .insert({
        email,
        token,
        invited_by: user.id,
        expires_at: expiresAt.toISOString(),
        status: 'pending'
      })
      .select()
      .single();

    if (inviteError) {
      console.error('Error creating invitation:', inviteError);
      return new Response(JSON.stringify({ error: "Erro ao criar convite" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get inviter profile
    const { data: inviterProfile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', user.id)
      .single();

    const inviterName = inviterProfile?.display_name || 'Administrador';
    const inviteUrl = `${req.headers.get('origin')}/invite/${token}`;

    // Send email
    const emailResponse = await resend.emails.send({
      from: "DryStore <onboarding@resend.dev>",
      to: [email],
      subject: "Convite para DryStore - Sistema de Comunicação Interna",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Bem-vindo à DryStore!</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
              Olá! 👋
            </p>
            
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
              <strong>${inviterName}</strong> convidou você para fazer parte do sistema de comunicação interna da <strong>DryStore</strong>.
            </p>
            
            ${message ? `
              <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366F1;">
                <p style="margin: 0; color: #374151; font-style: italic;">"${message}"</p>
              </div>
            ` : ''}
            
            <p style="font-size: 16px; color: #374151; margin-bottom: 30px;">
              Nossa plataforma centraliza toda a comunicação empresarial, facilitando a colaboração entre equipes, o compartilhamento de documentos e o acesso ao conhecimento corporativo.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteUrl}" style="background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Aceitar Convite
              </a>
            </div>
            
            <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #92400E; font-size: 14px;">
                ⚠️ <strong>Importante:</strong> Este convite expira em 7 dias. Se você não conseguir clicar no botão, copie e cole este link no seu navegador: <a href="${inviteUrl}" style="color: #92400E;">${inviteUrl}</a>
              </p>
            </div>
            
            <hr style="border: none; height: 1px; background: #E5E7EB; margin: 30px 0;">
            
            <p style="font-size: 14px; color: #6B7280; text-align: center; margin: 0;">
              Se você não esperava este convite, pode ignorar este email com segurança.
            </p>
          </div>
        </div>
      `,
    });

    if (emailResponse.error) {
      console.error('Error sending email:', emailResponse.error);
      
      // Delete the invitation if email failed
      await supabase
        .from('invitations')
        .delete()
        .eq('id', invitation.id);
        
      return new Response(JSON.stringify({ error: "Erro ao enviar email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update invitation status to sent
    await supabase
      .from('invitations')
      .update({ status: 'sent' })
      .eq('id', invitation.id);

    console.log('Invitation sent successfully:', {
      email,
      invitationId: invitation.id,
      emailId: emailResponse.data?.id
    });

    return new Response(JSON.stringify({ 
      success: true, 
      invitationId: invitation.id,
      inviteUrl 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error('Error in send-invitation function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);