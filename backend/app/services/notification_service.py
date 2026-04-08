import asyncio

from app.services.websocket_manager import manager


def notify_user_realtime(user_id: int, notification_data: dict):
    """Send a real-time notification via WebSocket.
    Works from both sync and async contexts."""
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(manager.send_to_user(user_id, notification_data))
    except RuntimeError:
        # No running event loop (called from sync context / background thread)
        pass


def send_push_to_user(db, user_id: int, title: str, body: str, data: dict | None = None):
    """Send a Firebase push notification to a user if they have a firebase_token."""
    from app.models.user import User
    from app.services.push_service import send_push_notification

    user = db.query(User).filter(User.id == user_id).first()
    if user and user.firebase_token:
        send_push_notification(user.firebase_token, title, body, data)
