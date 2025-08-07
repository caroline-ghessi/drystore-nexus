import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MessageCircle, Mail, Phone, Search, Users } from "lucide-react";
import { UserStatus } from "@/components/ui/user-status";

interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  status: string;
  job_positions?: {
    name: string;
    department?: string;
  };
}

export default function People() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    filterProfiles();
  }, [profiles, searchTerm, departmentFilter, statusFilter]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          job_positions (
            name,
            department
          )
        `)
        .order("display_name");

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterProfiles = () => {
    let filtered = profiles;

    if (searchTerm) {
      filtered = filtered.filter(profile =>
        profile.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.job_positions?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.job_positions?.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (departmentFilter !== "all") {
      filtered = filtered.filter(profile =>
        profile.job_positions?.department === departmentFilter
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(profile => profile.status === statusFilter);
    }

    setFilteredProfiles(filtered);
  };

  const getUniqueDepartments = () => {
    const departments = profiles
      .map(p => p.job_positions?.department)
      .filter(Boolean);
    return [...new Set(departments)];
  };

  const startDirectMessage = (userId: string) => {
    window.location.href = `/dm/${userId}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-semibold">Pessoas</h1>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, cargo ou departamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os departamentos</SelectItem>
            {getUniqueDepartments().map(dept => (
              <SelectItem key={dept} value={dept!}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="away">Ausente</SelectItem>
            <SelectItem value="busy">Ocupado</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Pessoas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProfiles.map((profile) => (
          <Card key={profile.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <UserStatus
                  name={profile.display_name || "Usuário"}
                  status={profile.status as any}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.job_positions && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {profile.job_positions.name}
                  </p>
                  {profile.job_positions.department && (
                    <Badge variant="secondary" className="text-xs">
                      {profile.job_positions.department}
                    </Badge>
                  )}
                </div>
              )}
              
              {profile.bio && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {profile.bio}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => startDirectMessage(profile.user_id)}
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Conversar
                </Button>
                <Button size="sm" variant="ghost">
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProfiles.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma pessoa encontrada</h3>
          <p className="text-muted-foreground">
            Tente ajustar os filtros de busca
          </p>
        </div>
      )}
    </div>
  );
}