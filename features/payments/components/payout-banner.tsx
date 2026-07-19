// server banner (submitted/resume/start states)
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/card";
import { SetupPayoutsButton } from "./setup-payouts-button";

/**
 * P4-01 - payout readiness banner. Drop into the mentor dashboard;
 * 
 * <PayoutBanner userId{session.user.id} payoutsParam={searchParams.payouts} />
 * 
 * Renders nothing for learners or payment-ready mentors. Keys off the 
 * webhook-maintained charges_enabled boolean - never off "has an account id",
 * which would lie about half-finished onboarding. 
 */
export async function PayoutBanner({
    userId, 
    payoutsParam, 
}: {
    userId: string;
    payoutsParam?: string;
}) {
    const { data: mentor } = await supabaseAdmin 
      .from("mentor_profiles")
      .select("stripe_account_id, charges_enabled")
      .eq("user_id", userId)
      .maybeSingle();
    
      if (!mentor || mentor.charges_enabled) return null;

      const justSubmitted = payoutsParam === "submitted";
      const resuming = !!mentor.stripe_account_id;

      return (
        <Card className="space-y-3 border-amber-200 bg-amber-50/60 p-5">
            {justSubmitted ? (
                <>
                <p className="text-sm font-medium">
                    Details submitted - Stripe is verifying your account. 
                </p>
                <p className="text-sm text-muted-foreground">
                    This usually takes minutes. Your slots become bookable
                    automatically once verification completes. If Stripe needs 
                    anything more, this banner will let you know. 
                </p> 
                </>
            ) : (
                <>
                <p className="text-sm font-medium">
                    {resuming
                      ? "Finish setting up payouts to start accepting bookings."
                      : "Set up payouts to start accepting bookings - takes about 5 minutes."}
                </p>
                <p className="text-sm text-muted-foreground">
                    Your bank details go directly to Stripe - the same company 
                    handling payments for millions of businesses. LIFFT never sees them.
                </p>
                <SetupPayoutsButton resuming={resuming} />
                </>
            )}
        </Card>
    );
}