using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace Ldf.Infrastructure.SignalR;

public class ChatHub : Hub
{
    public async Task JoinSession(string sessionId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, sessionId);
    }

    public async Task LeaveSession(string sessionId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, sessionId);
    }

    public async Task SendMessage(string sessionId, object message)
    {
        await Clients.Group(sessionId).SendAsync("ReceiveMessage", message);
    }

    public async Task SendTypingStatus(string sessionId, string userId, bool isTyping)
    {
        await Clients.Group(sessionId).SendAsync("ReceiveTypingStatus", new { userId, isTyping });
    }
}
