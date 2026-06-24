import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProfileService } from '../../core/profile/profile.service';
import { AuthService } from '../../core/auth/auth.service';
import { Profile } from '../../core/models/article.model';
import { ArticleQuery } from '../../core/models/article.model';
import { ArticleListComponent } from '../../shared/article-list.component';
import { FollowButtonComponent } from '../../shared/follow-button.component';

type ProfileTab = 'my' | 'favorited';

/**
 * Profile page (mirrors legacy src/js/profile/*). Shows the user header
 * (avatar/username/bio) with either an "Edit Profile Settings" link (own profile)
 * or a Follow button, and two article tabs: My Articles (author filter) and
 * Favorited Articles (favorited filter), reusing ArticleListComponent.
 */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, ArticleListComponent, FollowButtonComponent],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  /** Route param bound via withComponentInputBinding. */
  @Input({ required: true }) username!: string;

  private readonly profiles = inject(ProfileService);
  private readonly auth = inject(AuthService);

  readonly profile = signal<Profile | null>(null);
  readonly tab = signal<ProfileTab>('my');

  /** True when the viewed profile is the logged-in user. */
  readonly isUser = computed(() => {
    const current = this.auth.currentUser();
    const profile = this.profile();
    return !!current && !!profile && current.username === profile.username;
  });

  /** Query config for the active tab. */
  readonly listConfig = computed<ArticleQuery>(() => {
    const username = this.profile()?.username ?? this.username;
    return this.tab() === 'favorited'
      ? { type: 'all', filters: { favorited: username } }
      : { type: 'all', filters: { author: username } };
  });

  ngOnInit(): void {
    this.profiles.get(this.username).subscribe({
      next: (profile) => this.profile.set(profile),
    });
  }

  selectTab(tab: ProfileTab): void {
    this.tab.set(tab);
  }
}
