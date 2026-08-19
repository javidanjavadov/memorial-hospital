import QeydiyyatForm from "./qeydiyyat-form"
import { googleConfigured } from "@/lib/auth-flags"

export default function QeydiyyatPage() {
  return <QeydiyyatForm googleEnabled={googleConfigured} />
}
