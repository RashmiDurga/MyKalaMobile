export interface IAlert {
  id: number;
  type: string;
  message: string;
  show: boolean;
}
export class Alert {
  title: string;
  message: string;
  constructor(message: string, title: string) {
    this.title = title;
    this.message = message;
  }
}
