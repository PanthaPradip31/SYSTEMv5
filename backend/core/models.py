from django.db import models


class Tournament(models.Model):
    id = models.CharField(primary_key=True, max_length=255)
    name = models.CharField(max_length=255)
    status = models.CharField(max_length=100)
    format = models.CharField(max_length=100)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Team(models.Model):
    id = models.CharField(primary_key=True, max_length=255)
    name = models.CharField(max_length=255)
    short_name = models.CharField(max_length=100)
    logo = models.TextField(blank=True, null=True)
    color = models.CharField(max_length=50)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Player(models.Model):
    STATUS_ALIVE = 'alive'
    STATUS_KNOCKED = 'knocked'
    STATUS_ELIMINATED = 'eliminated'

    STATUS_CHOICES = [
        (STATUS_ALIVE, 'Alive'),
        (STATUS_KNOCKED, 'Knocked'),
        (STATUS_ELIMINATED, 'Eliminated'),
    ]

    id = models.CharField(primary_key=True, max_length=255)
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='players')
    name = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    kills = models.IntegerField(default=0)
    damage = models.IntegerField(default=0)
    photo = models.TextField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Standing(models.Model):
    team = models.OneToOneField(Team, on_delete=models.CASCADE, primary_key=True, related_name='standing')
    rank = models.IntegerField()
    total_points = models.IntegerField(default=0)
    total_kills = models.IntegerField(default=0)
    placement_points = models.IntegerField(default=0)
    kill_points = models.IntegerField(default=0)
    wwcd = models.IntegerField(default=0)
    matches_json = models.JSONField(default=list)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.team.name} standing"


class KillFeed(models.Model):
    id = models.CharField(primary_key=True, max_length=255)
    killer_id = models.CharField(max_length=255, blank=True, null=True)
    killer_name = models.CharField(max_length=255)
    killer_team = models.CharField(max_length=255)
    victim_id = models.CharField(max_length=255, blank=True, null=True)
    victim_name = models.CharField(max_length=255)
    victim_team = models.CharField(max_length=255)
    weapon = models.CharField(max_length=255)
    is_knock = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.killer_name} -> {self.victim_name}"


class OverlayConfig(models.Model):
    id = models.CharField(primary_key=True, max_length=255)
    show_rankings = models.BooleanField(default=True)
    show_kill_feed = models.BooleanField(default=True)
    show_team_status = models.BooleanField(default=True)
    show_match_info = models.BooleanField(default=True)
    show_player_cam = models.BooleanField(default=False)
    theme = models.CharField(max_length=100, default='default')
    animations_enabled = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"OverlayConfig {self.id}"


class Sponsor(models.Model):
    MEDIA_IMAGE = 'image'
    MEDIA_VIDEO = 'video'

    MEDIA_CHOICES = [
        (MEDIA_IMAGE, 'Image'),
        (MEDIA_VIDEO, 'Video'),
    ]

    id = models.CharField(primary_key=True, max_length=255)
    name = models.CharField(max_length=255)
    logo_url = models.TextField(blank=True, null=True)
    video_url = models.TextField(blank=True, null=True)
    media_type = models.CharField(max_length=20, choices=MEDIA_CHOICES, default=MEDIA_IMAGE)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Admin(models.Model):
    id = models.CharField(primary_key=True, max_length=255)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.email
