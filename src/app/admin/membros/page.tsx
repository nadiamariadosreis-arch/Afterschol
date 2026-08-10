import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { inviteMemberAction, setMemberRoleAction } from "./actions";

export default async function MembersAdminPage() {
  const supabase = await createClient();
  const { data: members } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <SectionHeading eyebrow="Membros" title="Famílias com acesso à plataforma" />

      <div className="flex flex-col gap-4 mb-10">
        {(members ?? []).map((member) => (
          <Card key={member.id} className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="font-display font-bold text-[18px] text-ink">
                {member.full_name ?? member.email}
              </h3>
              <p className="text-ink/50 text-[14px]">{member.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge tone={member.role === "admin" ? "sun" : "teal"}>
                {member.role === "admin" ? "Administradora" : "Membro"}
              </Badge>
              <form action={setMemberRoleAction}>
                <input type="hidden" name="memberId" value={member.id} />
                <input type="hidden" name="role" value={member.role} />
                <Button type="submit" variant="ghost">
                  {member.role === "admin" ? "Tornar membro" : "Tornar admin"}
                </Button>
              </form>
            </div>
          </Card>
        ))}

        {(members ?? []).length === 0 ? <p className="text-ink/60">Nenhum membro cadastrado ainda.</p> : null}
      </div>

      <Card>
        <h3 className="font-display font-bold text-[20px] text-ink mb-2">Convidar novo membro</h3>
        <p className="text-ink/60 text-[15px] mb-4">
          Um e-mail de convite é enviado para a família definir sua própria senha. Toda conta
          convidada já nasce com acesso completo à biblioteca de jogos.
        </p>
        <form action={inviteMemberAction} className="grid md:grid-cols-3 gap-3 items-end">
          <label className="flex flex-col gap-2">
            <span className="text-[14px] text-ink/70">E-mail</span>
            <input
              type="email"
              name="email"
              required
              className="border border-line bg-cream rounded-xl px-3 py-2 font-body text-ink outline-none focus:border-coral"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[14px] text-ink/70">Nome (opcional)</span>
            <input
              type="text"
              name="fullName"
              className="border border-line bg-cream rounded-xl px-3 py-2 font-body text-ink outline-none focus:border-coral"
            />
          </label>
          <Button type="submit" variant="primary">
            Enviar convite
          </Button>
        </form>
      </Card>
    </div>
  );
}
