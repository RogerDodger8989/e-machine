export interface MessageProvider {
  send(to: string, body: string, subject?: string): Promise<{ providerMessageId: string }>;
}
