import { User } from '../users/user.interface';

export interface BasePost {
    text: string;
    user_id: User['id'];        // Not returned from user-model getUserPosts()
}

export interface Post extends BasePost {
    id: number;
    postedBy?: User['name'];    // Only when returned from user-model getUserPosts()
}
