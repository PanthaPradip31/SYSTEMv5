from django.contrib import admin

from .models import Admin, KillFeed, OverlayConfig, Player, Sponsor, Standing, Team, Tournament


@admin.register(Tournament)
class TournamentAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'status', 'format', 'updated_at')
    search_fields = ('id', 'name', 'status', 'format')


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'short_name', 'color', 'updated_at')
    search_fields = ('id', 'name', 'short_name')


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'team', 'status', 'kills', 'damage', 'updated_at')
    search_fields = ('id', 'name', 'team__name')
    list_filter = ('status',)


@admin.register(Standing)
class StandingAdmin(admin.ModelAdmin):
    list_display = ('team', 'rank', 'total_points', 'total_kills', 'updated_at')
    search_fields = ('team__name',)


@admin.register(KillFeed)
class KillFeedAdmin(admin.ModelAdmin):
    list_display = ('id', 'killer_name', 'victim_name', 'weapon', 'is_knock', 'timestamp')
    search_fields = ('killer_name', 'victim_name', 'weapon')
    list_filter = ('is_knock',)


@admin.register(OverlayConfig)
class OverlayConfigAdmin(admin.ModelAdmin):
    list_display = ('id', 'show_rankings', 'show_kill_feed', 'show_team_status', 'theme', 'updated_at')


@admin.register(Sponsor)
class SponsorAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'media_type', 'updated_at')
    search_fields = ('id', 'name')


@admin.register(Admin)
class AdminModelAdmin(admin.ModelAdmin):
    list_display = ('email', 'name', 'created_at', 'updated_at')
    search_fields = ('email', 'name')

