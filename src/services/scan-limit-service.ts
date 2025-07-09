
import { supabase } from '@/integrations/supabase/client';
import { format, toZonedTime } from 'date-fns-tz';

class ScanLimitService {
  private readonly DAILY_LIMIT = 10;
  private readonly PDT_TIMEZONE = 'America/Los_Angeles';

  private getCurrentPDTDate(): string {
    const nowInPDT = toZonedTime(new Date(), this.PDT_TIMEZONE);
    return format(nowInPDT, 'yyyy-MM-dd', { timeZone: this.PDT_TIMEZONE });
  }

  async getTodaysScanCount(): Promise<number> {
    try {
      const pdtDate = this.getCurrentPDTDate();
      
      const { data, error } = await supabase
        .from('user_scans')
        .select('scan_count')
        .eq('scan_date', pdtDate)
        .maybeSingle();
      
      if (error) {
        console.error('Error getting scan count:', error);
        return 0;
      }
      
      return data?.scan_count || 0;
    } catch (error) {
      console.error('Error in getTodaysScanCount:', error);
      return 0;
    }
  }

  async incrementScanCount(): Promise<boolean> {
    try {
      const pdtDate = this.getCurrentPDTDate();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('user_scans')
        .upsert({
          user_id: user.id,
          scan_date: pdtDate,
          scan_count: 1
        }, {
          onConflict: 'user_id,scan_date',
          ignoreDuplicates: false
        });

      if (error) {
        // If upsert fails, try to increment existing record
        const { error: updateError } = await supabase
          .from('user_scans')
          .update({ 
            scan_count: supabase.raw('scan_count + 1'),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('scan_date', pdtDate);

        if (updateError) {
          console.error('Error incrementing scan count:', updateError);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error in incrementScanCount:', error);
      return false;
    }
  }

  async canUserScan(): Promise<{ canScan: boolean; remainingScans: number }> {
    const todaysCount = await this.getTodaysScanCount();
    const remainingScans = Math.max(0, this.DAILY_LIMIT - todaysCount);
    
    return {
      canScan: todaysCount < this.DAILY_LIMIT,
      remainingScans
    };
  }

  getDailyLimit(): number {
    return this.DAILY_LIMIT;
  }

  getCurrentPDTTime(): Date {
    return toZonedTime(new Date(), this.PDT_TIMEZONE);
  }
}

export const scanLimitService = new ScanLimitService();
