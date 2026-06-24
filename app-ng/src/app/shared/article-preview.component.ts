import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Article } from '../core/models/article.model';

/**
 * Article preview card (mirrors legacy article-preview.html).
 * The favorite button is display-only in this slice; the favoriting action is
 * implemented in a later (Category C) slice.
 */
@Component({
  selector: 'app-article-preview',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './article-preview.component.html',
})
export class ArticlePreviewComponent {
  @Input({ required: true }) article!: Article;
}
