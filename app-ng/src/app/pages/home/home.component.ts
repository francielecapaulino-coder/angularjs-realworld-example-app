import { Component, OnInit, inject, signal } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { TagsService } from '../../core/tags/tags.service';
import { ArticleQuery } from '../../core/models/article.model';
import { APP_CONSTANTS } from '../../core/config/app.constants';
import { ArticleListComponent } from '../../shared/article-list.component';

/**
 * Home page (mirrors legacy src/js/home/*): anonymous banner, feed/global/tag
 * tabs, popular-tags sidebar and the article list. The default tab is the
 * personal feed for authenticated users, otherwise the global feed.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ArticleListComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly tagsService = inject(TagsService);

  readonly appName = APP_CONSTANTS.appName;
  readonly isAuthenticated = this.auth.isAuthenticated;

  readonly tags = signal<string[]>([]);
  readonly tagsLoaded = signal(false);
  readonly listConfig = signal<ArticleQuery>({ type: 'all' });

  ngOnInit(): void {
    // Default tab depends on auth status.
    this.listConfig.set({ type: this.isAuthenticated() ? 'feed' : 'all' });

    this.tagsService.getAll().subscribe({
      next: (tags) => {
        this.tags.set(tags);
        this.tagsLoaded.set(true);
      },
      error: () => this.tagsLoaded.set(true),
    });
  }

  showGlobal(): void {
    this.listConfig.set({ type: 'all' });
  }

  showFeed(): void {
    this.listConfig.set({ type: 'feed' });
  }

  showTag(tag: string): void {
    this.listConfig.set({ type: 'all', filters: { tag } });
  }

  get activeTag(): string | undefined {
    return this.listConfig().filters?.tag;
  }

  isFeed(): boolean {
    return this.listConfig().type === 'feed';
  }

  isGlobal(): boolean {
    return this.listConfig().type === 'all' && !this.listConfig().filters?.tag;
  }
}
