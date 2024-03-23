export enum MessageType {
  SUCCESS = 'success',
  ERROR = 'danger',
  INFO = 'info',
}

export interface Message {
  type: MessageType;
  message: string;
}
