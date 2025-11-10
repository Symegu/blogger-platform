export class CreateCommentData {
  content: string;
  post_id: number;
  user_id: number;
  user_login: string;
}

export class UpdateCommentData {
  content: string;
  id: number;
  user_id: number;
}
