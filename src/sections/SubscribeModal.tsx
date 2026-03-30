import { useState } from 'react'
import { Heading as AriaHeading } from 'react-aria-components'
import { Mail01, CheckCircle } from '@untitledui/icons'
import { toast } from 'sonner'
import { ModalOverlay, Modal, Dialog } from '@/components/application/modals/modal'
import { Input } from '@/components/base/input/input'
import { Button } from '@/components/base/buttons/button'
import { FeaturedIcon } from '@/components/foundations/featured-icon/featured-icon'

interface SubscribeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SubscribeModal({ isOpen, onClose }: SubscribeModalProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setFirstName('')
      setLastName('')
      setEmail('')
      setIsLoading(false)
      setIsSuccess(false)
    }, 300)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.includes('@')) {
      toast.error('Please enter a valid email address.')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message ?? 'Subscription failed. Please try again.')
      }

      setIsSuccess(true)
      setTimeout(() => handleClose(), 3000)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ModalOverlay isOpen={isOpen} onOpenChange={(open) => { if (!open) handleClose() }} isDismissable>
      <Modal className="max-w-[420px]">
        <Dialog>
          <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl">
            {isSuccess ? (
              /* Success state */
              <div className="flex flex-col items-center gap-4 px-6 py-8 text-center">
                <FeaturedIcon color="success" theme="light" icon={CheckCircle} size="lg" />
                <div className="flex flex-col gap-1">
                  <AriaHeading slot="title" className="text-lg font-semibold text-primary">
                    You're subscribed!
                  </AriaHeading>
                  <p className="text-sm text-tertiary">
                    Look for The Weekly Roundup in your inbox every Monday at 10am EST.
                  </p>
                </div>
                <Button color="secondary" size="md" className="w-full" onClick={handleClose}>
                  Done
                </Button>
              </div>
            ) : (
              /* Form state */
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col items-center gap-4 px-6 py-8">
                  <FeaturedIcon color="brand" theme="light" icon={Mail01} size="lg" />
                  <div className="flex flex-col gap-1 text-center">
                    <AriaHeading slot="title" className="text-lg font-semibold text-primary">
                      The Weekly Roundup
                    </AriaHeading>
                    <p className="text-sm text-tertiary">
                      Every Monday at 10am EST — a witty digest of what shipped across Awesome Motive brands.
                    </p>
                  </div>

                  <div className="flex w-full flex-col gap-4">
                    {/* First + Last name row */}
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="First name"
                        placeholder="First name"
                        size="md"
                        value={firstName}
                        onChange={setFirstName}
                      />
                      <Input
                        label="Last name"
                        placeholder="Last name"
                        size="md"
                        value={lastName}
                        onChange={setLastName}
                      />
                    </div>

                    {/* Email */}
                    <Input
                      label="Email"
                      placeholder="you@example.com"
                      size="md"
                      type="email"
                      isRequired
                      value={email}
                      onChange={setEmail}
                    />

                    {/* Subscribe button */}
                    <Button
                      type="submit"
                      color="primary"
                      size="md"
                      className="w-full"
                      isLoading={isLoading}
                      showTextWhileLoading
                    >
                      Subscribe
                    </Button>
                  </div>

                  <p className="text-xs text-tertiary">No spam. Unsubscribe anytime.</p>
                </div>
              </form>
            )}
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  )
}
