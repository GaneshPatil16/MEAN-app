import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {

  authSubscription: Subscription;
  userAuthenticated = false;

  // posts = [
  //   {title: 'First Post', content: 'content of First post'},
  //   {title: 'Second Post', content: 'content of Second post'},
  //   {title: 'Third Post', content: 'content of Third post'},
  // ];
  posts: Post[] = [];
  private postsSub: Subscription;
  isLoading = false;
  userId: string;
  totalPosts = 0;
  currentPage = 1;
  postsPerPage = 2;
  pageSizeOptions = [1, 2, 5, 10];

  constructor(private postsService: PostsService, private authService: AuthService) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.userId = this.authService.getUserId();
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    this.postsSub = this.postsService.getUpdatedPosts().
    subscribe((postData: {posts: Post[], postCount: number}) => {
      this.totalPosts = postData.postCount
      this.posts = postData.posts;
      this.isLoading = false;
    });

    this.userAuthenticated = this.authService.getIsAuth();
    this.authSubscription = this.authService.getAuthenticationStatus()
    .subscribe(authStatus => {
      this.userAuthenticated = authStatus;
      this.userId = this.authService.getUserId();
    })
  }

  onPageChanged(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }

  onDelete(postId: string) {
    this.isLoading = true;
    this.postsService.deletePost(postId).subscribe(() => {
      this.postsService.getPosts(this.postsPerPage, this.currentPage);
    }, error => {
      this.isLoading = false;
    });
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
    this.authSubscription.unsubscribe();
  }

}
