from django.db import models
from django.contrib.auth.models import User

class Friendship(models.Model):
    user1 = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="friendship_user1"
    )
    user2 = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="friendship_user2"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user1", "user2")

    def save(self, *args, **kwargs):
        # Always store smaller id first for uniqueness (avoid duplicates in reverse order)
        if self.user1.id > self.user2.id:
            self.user1, self.user2 = self.user2, self.user1
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user1.username} ↔ {self.user2.username}"
