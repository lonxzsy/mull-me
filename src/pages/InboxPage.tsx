import { EmailList } from '../components/EmailList'
import { EmailViewer } from '../components/EmailViewer'

export function InboxPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <EmailList />
      <EmailViewer />
    </div>
  )
}
