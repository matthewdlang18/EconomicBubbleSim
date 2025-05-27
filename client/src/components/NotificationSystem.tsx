import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Info, 
  Home, 
  DollarSign,
  Shield,
  Clock,
  BookOpen
} from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  message: string;
  timestamp: number;
}

interface NotificationSystemProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'market_event':
      return <TrendingUp className="w-4 h-4" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4" />;
    case 'error':
      return <AlertTriangle className="w-4 h-4" />;
    case 'info':
      return <Info className="w-4 h-4" />;
    case 'education':
      return <BookOpen className="w-4 h-4" />;
    case 'policy':
      return <Shield className="w-4 h-4" />;
    case 'purchase':
      return <Home className="w-4 h-4" />;
    case 'investment':
      return <DollarSign className="w-4 h-4" />;
    default:
      return <Info className="w-4 h-4" />;
  }
}

function getNotificationColors(type: string) {
  switch (type) {
    case 'market_event':
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        titleColor: 'text-blue-900',
        textColor: 'text-blue-800'
      };
    case 'warning':
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
        titleColor: 'text-yellow-900',
        textColor: 'text-yellow-800'
      };
    case 'error':
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        titleColor: 'text-red-900',
        textColor: 'text-red-800'
      };
    case 'education':
      return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        titleColor: 'text-green-900',
        textColor: 'text-green-800'
      };
    case 'policy':
      return {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        titleColor: 'text-purple-900',
        textColor: 'text-purple-800'
      };
    case 'purchase':
      return {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        titleColor: 'text-emerald-900',
        textColor: 'text-emerald-800'
      };
    case 'investment':
      return {
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        iconBg: 'bg-indigo-100',
        iconColor: 'text-indigo-600',
        titleColor: 'text-indigo-900',
        textColor: 'text-indigo-800'
      };
    default:
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        iconBg: 'bg-gray-100',
        iconColor: 'text-gray-600',
        titleColor: 'text-gray-900',
        textColor: 'text-gray-800'
      };
  }
}

function getNotificationTitle(type: string) {
  switch (type) {
    case 'market_event':
      return 'Market Update';
    case 'warning':
      return 'Warning';
    case 'error':
      return 'Error';
    case 'info':
      return 'Information';
    case 'education':
      return 'Educational Insight';
    case 'policy':
      return 'Policy Change';
    case 'purchase':
      return 'Property Purchase';
    case 'investment':
      return 'Investment Activity';
    default:
      return 'Notification';
  }
}

function formatTimestamp(timestamp: number) {
  const now = Date.now();
  const diff = now - timestamp;
  
  if (diff < 60000) {
    return 'Just now';
  } else if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diff / 86400000);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}

function NotificationCard({ notification, onRemove }: { 
  notification: Notification; 
  onRemove: (id: string) => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  
  const colors = getNotificationColors(notification.type);
  const icon = getNotificationIcon(notification.type);
  const title = getNotificationTitle(notification.type);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Auto-remove after 10 seconds for non-error notifications
    if (notification.type !== 'error' && notification.type !== 'warning') {
      const timer = setTimeout(() => {
        handleRemove();
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [notification.id, notification.type]);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(notification.id), 300);
  };

  return (
    <Card 
      className={`
        ${colors.bg} ${colors.border} shadow-lg max-w-sm transition-all duration-300 transform
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isExiting ? 'translate-x-full opacity-0' : ''}
      `}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className={`${colors.iconBg} rounded-full p-2 flex-shrink-0`}>
            <div className={colors.iconColor}>
              {icon}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <div className={`text-sm font-medium ${colors.titleColor}`}>
                  {title}
                </div>
                <div className={`text-sm ${colors.textColor} mt-1 break-words`}>
                  {notification.message}
                </div>
                <div className="flex items-center mt-2 space-x-2">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(notification.timestamp)}
                  </span>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="p-1 h-auto hover:bg-gray-200/50"
              >
                <X className="w-4 h-4 text-gray-400" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function NotificationSystem({ notifications, onRemove }: NotificationSystemProps) {
  if (!notifications.length) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-40 space-y-2 max-h-[calc(100vh-6rem)] overflow-y-auto">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
      
      {/* Clear All Button - shows when there are many notifications */}
      {notifications.length > 3 && (
        <Card className="bg-gray-50 border-gray-200 shadow-sm">
          <CardContent className="p-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => notifications.forEach(n => onRemove(n.id))}
              className="w-full text-xs"
            >
              Clear All Notifications ({notifications.length})
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
