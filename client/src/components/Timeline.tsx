import { ReactNode } from 'react';
import { CheckCircle } from 'lucide-react';

interface TimelineItemProps {
  icon?: ReactNode;
  title: string;
  description: string;
  status?: 'completed' | 'active' | 'upcoming';
  isLast?: boolean;
}

interface TimelineProps {
  items: Omit<TimelineItemProps, 'isLast'>[];
  orientation?: 'vertical' | 'horizontal';
}

function TimelineItem({ icon, title, description, status = 'upcoming', isLast = false }: TimelineItemProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'completed':
        return {
          dot: 'bg-green-500 border-green-500 shadow-sm',
          line: 'bg-green-500',
          icon: 'text-white',
          title: 'text-gray-900',
          description: 'text-gray-600',
        };
      case 'active':
        return {
          dot: 'bg-blue-500 border-blue-500 shadow-md ring-4 ring-blue-100',
          line: 'bg-gray-200',
          icon: 'text-white',
          title: 'text-gray-900',
          description: 'text-gray-700',
        };
      case 'upcoming':
      default:
        return {
          dot: 'bg-white border-gray-300',
          line: 'bg-gray-200',
          icon: 'text-gray-400',
          title: 'text-gray-600',
          description: 'text-gray-500',
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div className="relative flex gap-4 pb-8 last:pb-0">
      {/* Timeline Line & Dot */}
      <div className="relative flex flex-col items-center">
        {/* Dot */}
        <div
          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10 ${styles.dot}`}
        >
          {status === 'completed' ? (
            <CheckCircle size={20} className="text-white" strokeWidth={2.5} />
          ) : (
            icon && <div className={styles.icon}>{icon}</div>
          )}
        </div>

        {/* Connecting Line */}
        {!isLast && (
          <div className={`w-0.5 flex-1 absolute top-10 bottom-0 transition-all duration-500 ${styles.line}`} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pt-1">
        <h3 className={`text-lg font-semibold mb-1 tracking-tight transition-colors ${styles.title}`}>
          {title}
        </h3>
        <p className={`text-sm leading-relaxed transition-colors ${styles.description}`}>
          {description}
        </p>
      </div>
    </div>
  );
}

export default function Timeline({ items, orientation = 'vertical' }: TimelineProps) {
  return (
    <div className={orientation === 'vertical' ? 'space-y-0' : 'flex gap-8'}>
      {items.map((item, index) => (
        <TimelineItem
          key={index}
          {...item}
          isLast={index === items.length - 1}
        />
      ))}
    </div>
  );
}

