import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Comment } from '../core/models/comment.model';

/**
 * A single comment card (mirrors legacy comment.html).
 * The comment body is rendered as TEXT (interpolation), never as HTML.
 */
@Component({
  selector: 'app-comment-card',
  standalone: true,
  imports: [DatePipe, RouterLink],
  template: `
    <div class="card">
      <div class="card-block">
        <p class="card-text">{{ comment.body }}</p>
      </div>
      <div class="card-footer">
        <a class="comment-author" [routerLink]="['/profile', comment.author.username]">
          @if (comment.author.image) {
            <img [src]="comment.author.image" class="comment-author-img" alt="" />
          }
        </a>
        &nbsp;
        <a class="comment-author" [routerLink]="['/profile', comment.author.username]">
          {{ comment.author.username }}
        </a>
        <span class="date-posted">{{ comment.createdAt | date: 'longDate' }}</span>
      </div>
    </div>
  `,
})
export class CommentCardComponent {
  @Input({ required: true }) comment!: Comment;
}
