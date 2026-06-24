import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Article } from '../core/models/article.model';
import { FavoriteButtonComponent } from './favorite-button.component';

/**
 * Article preview card (mirrors legacy article-preview.html).
 * The favorite button is interactive (Category C slice 010).
 */
@Component({
  selector: 'app-article-preview',
  standalone: true,
  imports: [DatePipe, RouterLink, FavoriteButtonComponent],
  templateUrl: './article-preview.component.html',
})
export class ArticlePreviewComponent {
  @Input({ required: true }) article!: Article;
}
