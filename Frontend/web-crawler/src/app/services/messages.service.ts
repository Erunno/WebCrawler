import { Injectable } from '@angular/core';
import { Message, MessageType } from '../models/message';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  addMessage: (m: Message) => void = () => null;

  setAddMessage(addMessage: (m: Message) => void) {
    this.addMessage = addMessage;
  }

  addSuccess(message: string) {
    this.addMessage({
      type: MessageType.SUCCESS,
      message,
    });
  }
}
