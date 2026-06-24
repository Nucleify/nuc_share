export interface ShareRequestSender {
  id: number
  name: string
  email: string
}

export interface ShareRequestInterface {
  id: number
  sender_id: number
  receiver_id: number
  entity_type: string
  entity_ids: number[]
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  sender?: ShareRequestSender
  receiver?: ShareRequestSender
}
