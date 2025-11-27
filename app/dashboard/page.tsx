import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { BonosDashboard } from "@/components/bonos-dashboard"

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    return <BonosDashboard user={session.user} />
}
