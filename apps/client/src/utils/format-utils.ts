import { format, format as dateFnsFormat,  formatDistanceToNow, parseISO , isValid} from "date-fns";



export const formatPhoneNumber = (phone: string): string => {
   if (!phone) return ""

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "")

  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
  } else if (cleaned.length > 10) {
    return `+${cleaned.slice(0, cleaned.length - 10)} (${cleaned.slice(cleaned.length - 10, cleaned.length - 7)}) ${cleaned.slice(cleaned.length - 7, cleaned.length - 4)}-${cleaned.slice(cleaned.length - 4)}`
  }

  // Return original if can't format
  return phone
}

// /**
//  * Format currency amount with proper formatting
//  */
// export function formatCurrency(amount: number, currency = "RWF"): string {
//   return new Intl.NumberFormat("en-RW", {
//     style: "currency",
//     currency: currency,
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 0,
//   }).format(amount)
// }


export const truncateText = (text: string, maxLength = 100): string => {
  if (!text || text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}



// Formats a number as currency (RWF by default)
export function formatCurrency(
  amount: number | string,
  currency: string = "RWF",
  locale: string = "en-RW",
): string {
  const value = typeof amount === "string" ? Number.parseFloat(amount) : amount;
  if (isNaN(value)) return `${currency} 0`;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "code", // Force display of currency code (RWF) instead of symbol (RF)
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// /**
//  * Formats a time string (HH:MM) to 12-hour format
//  */
// export const formatTime = (time: string): string => {
//   const [hours, minutes] = time.split(":")
//   const hour = Number.parseInt(hours, 10)
//   const ampm = hour >= 12 ? "PM" : "AM"
//   const formattedHour = hour % 12 || 12
//   return `${formattedHour}:${minutes} ${ampm}`
// }


  export const formatTime = (time: string) => {
    const hour = parseInt(time.split(':')[0])
    const minute = time.split(':')[1]
    const ampm = hour >= 12 ? 'pm' : 'am'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour.toString().padStart(2, '0')}:${minute} ${ampm}`
  }


// Formats a Date or date string to a readable format
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
  locale: string = "en-RW",
  type: "full" | "short" | "relative" = "full"
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (type === "relative") {
    return formatDistanceToNow(d, { addSuffix: true });
  }
  if (type === "short") {
    return format(d, "MMM dd, yyyy HH:mm");
  }
  // Default full format
  if (isNaN(d.getTime())) {
    return "Invalid date";
  }
  return d.toLocaleString(locale, options);
}


export function formatTimeRemaining(milliseconds: number): string {
  if (milliseconds <= 0) return "Ended";

  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

export const formatDuration = (startTime: string, endTime: string): string => {
  const start = new Date(`2000-01-01T${startTime}:00`)
  const end = new Date(`2000-01-01T${endTime}:00`)
  const diffMs = end.getTime() - start.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))

  if (diffMins < 60) {
    return `${diffMins}min`
  }

  const hours = Math.floor(diffMins / 60)
  const minutes = diffMins % 60

  return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`
}



// export function formatDateTime(dateString: string): string {
//   return new Date(dateString).toLocaleString("en-US", {
//     year: "numeric",
//     month: "short",
//     day: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// }


// export function formatCurrency(amount: number): string {
//   return new Intl.NumberFormat("en-US", {
//     style: "currency",
//     currency: "USD",
//   }).format(amount);
// }

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export function formatPercentage(num: number): string {
  return `${num > 0 ? "+" : ""}${num.toFixed(1)}%`;
}

export function formatDateTime(
  dateString: string,
  type: "full" | "short" | "relative" = "full",
): string {
  const date = parseISO(dateString);

  switch (type) {
    case "short":
      return format(date, "MMM dd, yyyy HH:mm");
    case "relative":
      return formatDistanceToNow(date, { addSuffix: true });
    default:
      return format(date, "MMM dd, yyyy HH:mm:ss");
  }
}


// export function formatTimeLeft(days: number, hours: number): string {
//   return `${days}d ${hours}h`;
// }


// export function formatDate(
//   date: Date | string,
//   formatStr: string = "MMMM d, yyyy",
// ): string {
//   const d = typeof date === "string" ? parseISO(date) : date;
//   if (!isValid(d)) return "Invalid Date";
//   return dateFnsFormat(d, formatStr);
// }

export function formatTimeAgo(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "Invalid Date";
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatDateShort(
  date: Date | string,
  formatStr: string = "MMM d, yyyy",
): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "Invalid Date";
  return dateFnsFormat(d, formatStr);
}

// export function formatDateTime(
//   date: Date | string,
//   formatStr: string = "dd/MM/yyyy -  HH:mm:ss",
// ): string {
//   const d = typeof date === "string" ? parseISO(date) : date;
//   if (!isValid(d)) return "Invalid Date";
//   return dateFnsFormat(d, formatStr);
// }

// export function formatTime(
//   date: Date | string,
//   formatStr: string = "HH:mm - dd/MM/yy",
// ): string {
//   const d = typeof date === "string" ? parseISO(date) : date;
//   if (!isValid(d)) return "Invalid Date";
//   return dateFnsFormat(d, formatStr);
// }


// export function formatCurrency(amount: string | number): string {
//   const num = typeof amount === "string" ? Number.parseFloat(amount) : amount;
//   return new Intl.NumberFormat("rw-RW", {
//     style: "currency",
//     currency: "RWF",
//   }).format(num);
// }

// export function formatNumber(num: number): string {
//   return new Intl.NumberFormat("en-US").format(num);
// }

// export function formatDate(dateString: string): string {
//   return new Date(dateString).toLocaleDateString("en-US", {
//     year: "numeric",
//     month: "short",
//     day: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// }


// export const formatDuration = (ms: number) => {
//     if (ms < 1000) return `${ms}ms`;
//     if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
//     return `${(ms / 60000).toFixed(1)}m`;
//   };


// export function formatDistanceToNow(
//   date: Date | string,
//   options: { addSuffix?: boolean } = { addSuffix: true },
// ): string {
//   // moment.fromNow expects a boolean "withoutSuffix", so we negate addSuffix
//   const withoutSuffix = options.addSuffix === false;
//   return moment(date).fromNow(withoutSuffix);
// }

 export const formatDateToNow = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60),
      );
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };


   export const formatRelativeTime = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60),
      );
  
      if (diffInHours < 1) return "Just now";
      if (diffInHours < 24) return `${diffInHours}h ago`;
      if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
      return formatDate(dateString);
    };


    
    export const formatTimeLeft = (endTime: string) => {
        const now = new Date();
        const end = new Date(endTime);
        const diff = end.getTime() - now.getTime();
    
        if (diff <= 0) return "Ended";
    
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
      };
    


   
      export function formatRetryTime(seconds: number): string {
        const retryTime = new Date(Date.now() + seconds * 1000)
        return formatDistanceToNow(retryTime, { addSuffix: true })
      }
      
      
      // /**
      //  * Format date for display
      //  */
      // export function formatDate(dateString: string): string {
      //   try {
      //     const date = parseISO(dateString)
      //     if (!isValid(date)) return "Invalid Date"
      //     return format(date, "MMM dd, yyyy")
      //   } catch {
      //     return "Invalid Date"
      //   }
      // }
      
      // /**
      //  * Format date and time for display
      //  */
      // export function formatDateTime(dateString: string): string {
      //   try {
      //     const date = parseISO(dateString)
      //     if (!isValid(date)) return "Invalid Date"
      //     return format(date, "MMM dd, yyyy 'at' HH:mm")
      //   } catch {
      //     return "Invalid Date"
      //   }
      // }






