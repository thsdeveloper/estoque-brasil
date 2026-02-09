import { PolicyForm } from "@/features/access/components/policies/PolicyForm"

export default function CreatePoliticaPage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <PolicyForm mode="create" />
    </div>
  )
}
