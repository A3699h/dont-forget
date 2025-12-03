import React, { useState } from 'react';
import { FaCopy, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import './MeetingTemplates.css';

const MeetingTemplates = () => {
  const [expandedCategories, setExpandedCategories] = useState({});
  const [copySuccess, setCopySuccess] = useState('');

  const templateCategories = [
    { value: 'all', label: 'All Templates' },
    { value: 'professional-follow-up', label: 'Professional Follow-Up' },
    { value: 'meeting-request', label: 'Meeting Request' },
    { value: 'thank-you', label: 'Thank You / Appreciation' },
    { value: 'appointment-reminder', label: 'Appointment Reminder' },
    { value: 'payment-request', label: 'Payment Request' },
    { value: 'deadline-reminder', label: 'Deadline Reminder' },
    { value: 'interview', label: 'Interview Invitation / Confirmation' },
    { value: 'customer-feedback', label: 'Customer Feedback Request' },
    { value: 'service-project-update', label: 'Service / Project Update' },
    { value: 'event-invitation', label: 'Event Invitation' },
    { value: 'sales-copy', label: 'Sales Copy' },
    { value: 'peer-communication', label: 'Peer-to-Peer Communication' },
    { value: 'teacher-parent', label: 'Teacher-to-Parent/Guardian Outreach' },
    { value: 'consultant-outreach', label: 'Consultant/Service Provider Outreach' },
    { value: 'internal-team', label: 'Internal Team Coordination' },
    { value: 'conflict-resolution', label: 'Conflict Resolution / Delicate Situations' },
    { value: 'networking', label: 'Networking & Relationship Building' },
    { value: 'professional-declines', label: 'Professional Declines'}
  ];

  const templates = [
    
    
    
    ,
    {
      id: 7,
      title: 'Gentle Check-In',
      category: 'professional-follow-up',
      content: `Hello [Name], I’m circling back on my note regarding [topic] to be sure it reached you and to keep our momentum. If there’s context I can add or a different format that would be easier to review, I’m happy to provide it. I want this to be simple, clear, and useful for you, and I’m available to align on next steps whenever it suits your schedule.

When you have a moment, a quick reply or a suggested time works perfectly.
Sincerely,
[Your Name]`
    },
    {
      id: 8,
      title: 'Polite Nudge With Help Offered',
      category: 'professional-follow-up',
      content: `Hi [Name], just following up on [topic] in case it slipped down the inbox. I can resend the materials, summarize the decision points, or jump on a brief call—whichever helps you evaluate this efficiently. My aim is to support your process, not add to your workload.

Let me know what would make this easiest on your end.
Best regards,
[Your Name]`
    },
    {
      id: 9,
      title: 'Clear Path Forward',
      category: 'professional-follow-up',
      content: `Hello [Name], I wanted to reconnect on [topic] and confirm the best path forward. If the answer is yes, I’ll prepare [deliverable/next step]; if no, I’ll close the loop so nothing lingers. If you prefer to revisit later, I can set a reminder and follow up then.

A quick “yes,” “no,” or “later” is perfect.
Respectfully,
[Your Name]`
    },
    {
      id: 10,
      title: 'Recap + Decision Prompt',
      category: 'professional-follow-up',
      content: `Hi [Name], brief recap from my last message on [date]: we discussed [point A], [point B], and a possible timeline of [date range]. I’m ready to proceed exactly as outlined or adjust to fit your priorities. I value clarity and want to ensure this stays streamlined for you.

Shall we confirm the next step?
Kind regards,
[Your Name]`
    },
    {
      id: 11,
      title: 'Formal Scheduling Request',
      category: 'meeting-request',
      content: `Dear [Name], I’d like to schedule a brief meeting to discuss [topic] and align on [decision/outcome]. I propose [two date/time options] and can adapt to your availability if those don’t work. I’ll keep the agenda concise and share it in advance so we’re focused and efficient.

Please let me know your preferred time or suggest one that suits you.
Sincerely,
[Your Name]`
    },
    {
      id: 12,
      title: 'Friendly, Efficient Ask',
      category: 'meeting-request',
      content: `Hello [Name], I’d like to schedule a short meeting to review [topic] and ensure we’re aligned on the next steps. I’ll provide a clear agenda, outline key options, and share any supporting materials in advance so our time together is focused and productive. I’m happy to connect through [platform] or whichever method you prefer. Could you let me know a time this week that works best for you?

Best regards,
[Your Name]`
    },
    {
      id: 13,
      title: 'Executive-Style Invite',
      category: 'meeting-request',
      content: `Hi [Name], to accelerate [goal/outcome], I recommend a focused touchpoint on [topic]. I can meet [option A] or [option B], and I’ll circulate a one-page brief beforehand to maximize the value of our time.

Kindly share the slot that aligns with your calendar.
Respectfully,
[Your Name]`
    },
    {
      id: 14,
      title: 'Data-Backed Request',
      category: 'meeting-request',
      content: `Hello [Name], I’ve pulled the latest data on [topic] and outlined three actionable choices. A short meeting will help us select the best route and lock timelines. I’m available [two options] and flexible as needed.

Shall I place something on the calendar?
Warm regards,
[Your Name]`
    },
    {
      id: 15,
      title: 'After Assistance',
      category: 'thank-you',
      content: `Dear [Name], thank you for your time and thoughtful input on [topic]. Your clarity helped move this forward, and I appreciate the care you brought to each detail. I’m putting your guidance to work immediately.

Please know your support made a real difference.
With appreciation,
[Your Name]`
    },
    {
      id: 16,
      title: 'After Collaboration',
      category: 'thank-you',
      content: `Hello [Name], I want to express sincere thanks for partnering on [project]. Your reliability and perspective elevated the outcome, and the process was smoother because of you. I look forward to our next opportunity to collaborate.

Grateful for your contribution.
Best regards,
[Your Name]`
    },
    {
      id: 17,
      title: 'After Referral / Introduction',
      category: 'thank-you',
      content: `Hi [Name], thank you for the introduction to [contact/company]. Your vote of confidence means a lot, and I’ll treat the relationship with the same respect you showed me. I’ll keep you posted on progress as it develops.

I appreciate you making the connection.
Sincerely,
[Your Name]`
    },
    {
      id: 18,
      title: 'After Attending/Showing Up',
      category: 'thank-you',
      content: `Hello [Name], I appreciate you taking the time to attend [meeting/event]. Your presence and insights added real value, and I’m excited about the momentum that came from it. I’ll follow up with a concise recap and next steps.

Thank you again for being there.
Kind regards,
[Your Name]`
    },
    {
      id: 19,
      title: 'Standard Courtesy Reminder',
      category: 'appointment-reminder',
      content: `Hello [Name], a quick reminder of your appointment on [date] at [time] for [purpose]. Please plan a few extra minutes for check-in so we can begin right on time. If anything changes, you can adjust through [link/instructions].

We look forward to seeing you.
Sincerely,
[Your Name / Company]`
    },
    {
      id: 20,
      title: 'Prep-Focused Reminder',
      category: 'appointment-reminder',
      content: `Hi [Name], your appointment is set for [date] at [time]. To make the most of our time, please bring [documents/items] and review [brief/prep link] in advance. If you need to reschedule, just let us know 24 hours ahead.

Thanks for prioritizing this visit.
Best regards,
[Your Name / Company]`
    },
    {
      id: 21,
      title: 'Day-Of Confirmation',
      category: 'appointment-reminder',
      content: `Good [morning/afternoon], [Name]. We’re confirmed for today at [time]. We’ll be ready on our side; if you’re running behind, a quick note helps us accommodate you. Parking/entry details: [brief info].

See you soon.
Respectfully,
[Your Name / Company]`
    },
    {
      id: 22,
      title: 'Virtual Session Reminder',
      category: 'appointment-reminder',
      content: `Hello [Name], this is a reminder for your virtual appointment on [date] at [time]. Your access link is here: [link]. Please test your audio/video a few minutes early so we can start smoothly.

We’re looking forward to meeting with you.
Warm regards,
[Your Name / Company]`
    },
    {
      id: 23,
      title: 'Courteous Initial Request',
      category: 'payment-request',
      content: `Hello [Name], the invoice for [service/project] in the amount of [amount] is ready for review. For convenience, you can complete payment securely via [link/method]. If you need a PO, revised details, or a receipt format, I’m happy to provide it.

Thank you in advance for taking care of this.
Sincerely,
[Your Name]`
    },
    {
      id: 24,
      title: 'Friendly Reminder (Not Past Due)',
      category: 'payment-request',
      content: `Hi [Name], I wanted to kindly remind you that payment for [service/project/product] in the amount of [amount] is coming due on [due date]. I completely understand how easy it is for these details to slip through a busy schedule, so I wanted to keep this visible for you. For convenience, you can use this secure link to complete the payment: [link]. If you or your team need any specific documentation—such as a confirmation note, itemized details, or a custom format—please let me know and I’ll provide it right away.

I truly appreciate your attention to this and the opportunity to continue working together. Thank you in advance for taking care of it at your convenience, and don’t hesitate to reach out if there’s anything I can do to make the process smoother.
Best regards,
[Your Name]`
    },
    {
      id: 25,
      title: 'Clear Past-Due Note (Professional)',
      category: 'payment-request',
      content: `Dear [Name], I’m following up on invoice [#] for [amount], which shows as outstanding since [date]. I understand delays happen, and I’m glad to help with any documentation needed. The payment link is [link], and I’ll confirm receipt once complete.

Thank you for resolving this at your earliest convenience.
Respectfully,
[Your Name]`
    },
    {
      id: 26,
      title: 'Partial / Plan Option',
      category: 'payment-request',
      content: `Hello [Name], if full payment of [amount] by [date] is difficult, we can arrange an installment plan so your work continues uninterrupted. I can outline two or three simple options for your approval.

Let me know what works best for you.
Kind regards,
[Your Name]`
    },
    {
      id: 27,
      title: 'Upcoming Deadline',
      category: 'deadline-reminder',
      content: `Hi [Name], a reminder that [deliverable] is scheduled for [deadline]. To keep our timeline intact, please confirm status and note any blockers so we can remove them quickly. I’m available to help refine scope if needed.

Thanks for keeping this on track.
Sincerely,
[Your Name]`
    },
    {
      id: 28,
      title: 'Mid-Sprint Check',
      category: 'deadline-reminder',
      content: `Hello [Name], as we approach [deadline], I’m checking on [work item] to ensure we’ll land the handoff smoothly. If priorities shifted, let’s adjust the plan instead of forcing a squeeze at the end.

A brief update today would be helpful.
Best regards,
[Your Name]`
    },
    {
      id: 29,
      title: 'Materials Needed',
      category: 'deadline-reminder',
      content: `Dear [Name], we’re targeting [deadline] for [output]. To finalize on time, we still need [inputs/assets/approvals]. Once those arrive, production will proceed without delay.

Could you share the items or a quick ETA?
Respectfully,
[Your Name]`
    },
    {
      id: 30,
      title: 'Final Gentle Reminder',
      category: 'deadline-reminder',
      content: `Hi [Name], this is a friendly reminder that [deliverable] is due [date/time]. If last-minute changes are required, I can adjust resources to keep quality intact.

Please confirm we’re set.
Warm regards,
[Your Name]`
    },
    {
      id: 31,
      title: 'Invitation + Options',
      category: 'interview',
      content: `Hello [Candidate Name], thank you for your interest in [role]. We’d like to invite you to an interview to learn more about your experience with [skill/area]. Available times: [option A], [option B], [option C]. We’ll share a brief agenda and participants in advance.

Please let me know which slot works best.
Sincerely,
[Your Name] | [Company]`
    },
    {
      id: 32,
      title: 'Confirmation + Prep',
      category: 'interview',
      content: `Hi [Candidate Name], your interview is confirmed for [date] at [time] via [platform/location]. You’ll meet with [names/titles]. To prepare, you may wish to review [brief/company page]. We want you set up for a confident conversation.

Looking forward to meeting you.
Best regards,
[Your Name] | [Company]`
    },
    {
      id: 33,
      title: 'Reschedule With Care',
      category: 'interview',
      content: `Dear [Candidate Name], due to [reason], we need to reschedule your interview. I apologize for the inconvenience and appreciate your flexibility. New options are [A/B/C], and we’ll ensure all details are squared away in advance.

Please choose the time that works for you.
Respectfully,
[Your Name] | [Company]`
    },
    {
      id: 34,
      title: 'Post-Interview Next Steps',
      category: 'interview',
      content: `Hello [Candidate Name], thank you for speaking with us today. We’re reviewing feedback and will update you by [date] regarding next steps. If you have any follow-up materials to share, feel free to send them along.

It was a pleasure learning more about your background.
Kind regards,
[Your Name] | [Company]`
    },
    {
      id: 35,
      title: 'Quick Pulse Check',
      category: 'customer-feedback',
      content: `Hi [Name], we’d value your feedback on your recent experience with [product/service]. A few lines about what worked well and what we can improve will help us serve you better. Here’s a quick link: [link].

Thank you for sharing your perspective.
Sincerely,
[Your Name]`
    },
    {
      id: 36,
      title: 'Short Survey Invite',
      category: 'customer-feedback',
      content: `Hello [Name], your insights matter to us. Would you take 60 seconds to complete this brief survey about [experience]? Your input directly influences our roadmap and support. Survey: [link].

We appreciate your time and candor.
Best regards,
[Your Name]`
    },
    {
      id: 37,
      title: 'Testimonial Kindly Requested',
      category: 'customer-feedback',
      content: `Dear [Name], if your experience met or exceeded expectations, a short testimonial would mean a lot to our team. Two or three sentences about the outcome or benefits is perfect. You can submit it here: [link].

Thank you for considering this.
Respectfully,
[Your Name]`
    },
    {
      id: 38,
      title: 'Close-Loop Follow-Up',
      category: 'customer-feedback',
      content: `Hi [Name], thanks for your earlier feedback on [issue/topic]. We’ve implemented [change/fix] and would love to know if it improved your experience. A quick note back helps us confirm we’re on the right track.

Appreciate your partnership in making this better.
Kind regards,
[Your Name]`
    },
    {
      id: 39,
      title: 'Milestone Reached',
      category: 'service-project-update',
      content: `Hello [Name], a quick update on [project]: we’ve completed [milestone] and are moving into [next phase]. The work remains on schedule and within scope, and we’ll share artifacts in your dashboard by [date].

Please let me know if you’d like a brief walkthrough.
Sincerely,
[Your Name]`
    },
    {
      id: 40,
      title: 'Minor Delay, Plan Intact',
      category: 'service-project-update',
      content: `Hi [Name], sharing status on [project]. We encountered a minor delay due to [reason], but mitigations are in place and the overall timeline remains intact. I’ll provide the revised micro-schedule by [date] so you have full visibility.

Thank you for your patience and trust.
Best regards,
[Your Name]`
    },
    {
      id: 41,
      title: 'Decision Needed',
      category: 'service-project-update',
      content: `Dear [Name], we’ve reached a decision point on [item]. I recommend [option] because [brief rationale], though I’m happy to review alternatives. Once confirmed, we’ll proceed immediately to keep momentum.

Could you share your preference today or suggest a time to discuss?
Respectfully,
[Your Name]`
    },
    {
      id: 42,
      title: 'Delivery Handoff',
      category: 'service-project-update',
      content: `Hello [Name], [deliverable] is ready for your review. You’ll find files and notes here: [link], along with a concise changelog. After your approval, we’ll finalize and schedule the rollout.

Please tell me if any adjustments are needed.
Kind regards,
[Your Name]`
    },
    {
      id: 43,
      title: 'Formal Invitation',
      category: 'event-invitation',
      content: `Dear [Name], you’re invited to [Event Name] on [date] at [location/platform]. We’ll cover [high-level agenda] and create space for meaningful conversation and connection. Your perspective would be a valuable addition to the room.

Kindly RSVP by [date] at [link].
Sincerely,
[Your Name]`
    },
    {
      id: 44,
      title: 'Warm Community Invite',
      category: 'event-invitation',
      content: `Hello [Name], we’re hosting [Event Name] on [date], and we’d love for you to join us. Expect practical insights, open Q&A, and genuine networking—no fluff. Details and RSVP: [link].

Hope to see you there.
Best regards,
[Your Name]`
    },
    {
      id: 45,
      title: 'VIP/Small-Group Feel',
      category: 'event-invitation',
      content: `Hi [Name], we’re gathering a small group for [Event Name] on [date] to dive deeply into [theme]. The format is interactive and candid, and we’d value your voice in the mix. Please let me know if we can reserve a seat for you.

Respectfully,
[Your Name]`
    },
    {
      id: 46,
      title: 'Last Call Invitation',
      category: 'event-invitation',
      content: `Hello [Name], a quick note that [Event Name] is coming up on [date]. If you’ve been considering it, this is a great moment to confirm so we can prepare materials for you. Full info here: [link].

I would love to have you with us.
Warm regards,
[Your Name]`
    },
    {
      id: 47,
      title: 'General Introduction',
      category: 'sales-copy',
      content: `Hello [Client’s Name], I wanted to introduce you to [Your Service/Offer], created to help with [main problem it solves]. With this, you’ll be able to [specific benefit] without the stress of [pain point]. Many of our clients have already seen results such as [brief example], and we’d love for you to experience the same. This is a straightforward way to [desired outcome] without wasting valuable time.

If you’d like to learn more, I’d be glad to share details or answer any questions.
Sincerely,
[Your Name]`
    },
    {
      id: 48,
      title: 'Special Offer',
      category: 'sales-copy',
      content: `Hi [Client’s Name], we’re currently offering [product/service] at [special condition — discount, bonus, free trial] for a limited time. This is designed to help you [specific benefit] while keeping things affordable and simple. Opportunities like this don’t last long, and we want to make sure you can take advantage before it closes.

If this sounds like something that could support you, I’d be happy to share the details and get you started today.
Best regards,
[Your Name]`
    },
    {
      id: 49,
      title: 'Benefit-Focused Pitch',
      category: 'sales-copy',
      content: `Hello [Client’s Name], if you’ve been looking for a reliable way to [achieve goal], [Your Service/Product] may be exactly what you need. It takes the stress out of [pain point] by offering [clear solution]. Instead of juggling multiple tools or losing track of next steps, this gives you one streamlined way to stay on top of everything.

I’d love to show you how quickly this can make a difference for you. Let me know if you’d like to set up a quick chat.
Kind regards,
[Your Name]`
    },
    {
      id: 50,
      title: 'Testimonial-Style Approach',
      category: 'sales-copy',
      content: `Hi [Client’s Name], I thought you’d like to know how others are using [Your Service]. For example, [Customer/Client Example] was able to [specific outcome] in just [timeframe]. Their feedback was that it saved them [specific benefit — time, money, stress]. If it worked for them, there’s no reason it can’t work for you as well.

If you’re open, I’d be glad to share more examples and walk you through how to get started today.
Warm regards,
[Your Name]`
    },
    {
      id: 51,
      title: 'Sharing Resources',
      category: 'peer-communication',
      content: `Hi [Name], I came across [resource/article/tool] and thought it might be useful for you, given our recent discussion on [topic]. It struck me as practical and easy to apply, and I figured it could save you some time as well. I always appreciate when peers share tools that make the workday smoother, so I wanted to pass this along.

Looking forward to hearing if it’s as helpful for you as it was for me.
Best regards,
 [Your Name]`
    },
    {
      id: 52,
      title: 'Offering Help',
      category: 'peer-communication',
      content: `Hello [Name], I know you’ve been working on [project/task], and I just wanted to check in to see if you could use a hand. Sometimes an extra set of eyes or a quick brainstorming session makes all the difference, and I’d be glad to support you if it helps lighten your load.

Don’t hesitate to let me know—I’m happy to collaborate.
Warm regards,
 [Your Name]`
    },
    {
      id: 53,
      title: 'Peer Check-In',
      category: 'peer-communication',
      content: `Hi [Name], it’s been a little while since we last caught up, and I wanted to see how things are going on your end. I know balancing [responsibilities/projects] can get overwhelming, so I thought I’d check in. Sometimes even a short conversation can bring fresh ideas or motivation.

Would you be open to a quick touch-base this week?
Kindly, 
[Your Name]`
    },
    {
      id: 54,
      title: 'Recognizing Good Work',
      category: 'peer-communication',
      content: `Hello [Name], I just wanted to say how impressed I was with your work on [specific project/task]. The clarity and effort you put into it stood out, and I thought it was worth acknowledging. Peers don’t always pause to appreciate one another’s contributions, but I believe it makes a difference.

Great job, and I look forward to learning from your approach.
Respectfully, 
[Your Name]`
    },
    {
      id: 55,
      title: 'Progress Update',
      category: 'teacher-parent',
      content: `Dear [Parent/Guardian], I’m happy to share that [Student Name] has been excelling in [subject/skill]. Their recent work shows stronger confidence and deeper understanding, and their participation in class has been a joy to see. These improvements reflect both their effort and the encouragement you provide at home.

Thank you for reinforcing these positive habits—we truly make the best progress together.
Sincerely,
 [Your Name]`
    },
    {
      id: 56,
      title: 'Attendance Concern',
      category: 'teacher-parent',
      content: `Hello [Parent/Guardian], I wanted to note that [Student Name] has missed several classes recently. Regular attendance is crucial for maintaining their academic progress, and I’d like to avoid any setbacks. If there are circumstances affecting attendance, I’d be glad to discuss ways we can work together to support them.

Your partnership in this is greatly appreciated.
Warm regards, 
[Your Name]`
    },
    {
      id: 57,
      title: 'Classroom Behavior',
      category: 'teacher-parent',
      content: `Dear [Parent/Guardian], today [Student Name] struggled with [behavior] during [class]. While it’s not uncommon, I wanted to inform you so we can address it consistently. In class, we are encouraging positive responses and respectful participation, and with reinforcement at home, I’m confident progress will follow.

Thank you for working with me to support their growth.
Kind regards, 
[Your Name]`
    },
    {
      id: 58,
      title: 'Parent-Teacher Meeting Request',
      category: 'teacher-parent',
      content: `Hello [Parent/Guardian], I’d like to schedule a short meeting to discuss [Student Name]’s progress in [subject/area]. We can review their strengths, areas for improvement, and steps to support their learning further. I’m available [option A] or [option B], and can adjust to your schedule.

Please let me know which time works best.
Respectfully, 
[Your Name]`
    },
    {
      id: 59,
      title: 'Introductory Outreach',
      category: 'consultant-outreach',
      content: `Hello [Client Name], I work with professionals on simplifying [challenge] and streamlining the way they achieve [goal]. Many clients have found that even small adjustments here can free up time and deliver measurable results. I thought you might find value in exploring if this approach could apply to your situation.

Would you be open to a short, no-pressure conversation?
Sincerely, 
[Your Name]`
    },
    {
      id: 60,
      title: 'Proposal Reminder',
      category: 'consultant-outreach',
      content: `Hi [Client Name], just following up on the proposal I sent for [project/service]. It was crafted to specifically address [challenge] and ensure you see [key benefit]. If you’d like, I can refine the details to align more closely with your preferences.

Shall we set a time this week to review it together?
Best regards, 
[Your Name]`
    },
    {
      id: 61,
      title: 'Onboarding Welcome',
      category: 'consultant-outreach',
      content: `Hello [Client Name], I’m delighted to begin working with you on [project/service]. To get started, we’ll begin with [first step], and I’ll provide a clear overview so the process feels smooth and manageable. My focus is on delivering immediate value while building long-term results.

I’m looking forward to our collaboration.
Warmly,
 [Your Name]`
    },
    {
      id: 62,
      title: 'Ongoing Client Check-In',
      category: 'consultant-outreach',
      content: `Hi [Client Name], I hope this note finds you well. I wanted to touch base to see how [service/project] has been working for you so far. I value hearing what’s working well and what could be fine-tuned—it helps ensure you’re always getting the best return on your investment.

I’d love to hear your thoughts when you have a moment.
Respectfully,
 [Your Name]`
    },
    {
      id: 63,
      title: 'Status Update',
      category: 'internal-team',
      content: `Team, here’s a quick snapshot of where we stand on [project/workstream]. [Milestone] is complete, [next step] is in motion, and the only blockers are [brief list]. Addressing them quickly will keep us on schedule and avoid bottlenecks. Consistent updates like this ensure we stay aligned.

Please share if you see risks I may have overlooked.
Thanks, 
[Your Name]`
    },
    {
      id: 64,
      title: 'Task Handoff',
      category: 'internal-team',
      content: `Hi [Name], I’m handing off [task/project] to you. Core details: [short outline], with all files available here: [link]. If you’d prefer, I can walk you through the context so you feel fully briefed. The intent is to make the transition smooth and ensure steady progress.

I trust this will move forward well under your guidance.
Best regards,
 [Your Name]`
    },
    {
      id: 65,
      title: 'Deadline Alignment',
      category: 'internal-team',
      content: `Team, a reminder that [deliverable] is due on [date]. Progress looks strong overall, but we still need [missing inputs/approvals] to close everything out. If priorities have shifted, now is the time to realign. A little adjustment early prevents crunch time later.

Thanks for keeping focus sharp.
Sincerely,
 [Your Name]`
    },
    {
      id: 66,
      title: 'Meeting Recap',
      category: 'internal-team',
      content: `Hi All, thank you for today’s thoughtful discussion. Here’s a quick recap of the key outcomes: [point A], [point B], and [point C]. Next steps have been assigned to [names], with due dates of [dates]. This summary is to ensure we’re fully aligned and moving forward with clarity. Let’s plan a quick touchpoint midweek to confirm progress and address any questions early.

Kind regards,
[Your Name]`
    },
    {
      id: 67,
      title: 'Misunderstanding Clarification',
      category: 'conflict-resolution',
      content: `Hi [Name], I’d like to revisit our recent exchange regarding [topic]. I realize my message may not have landed as I intended, and I want to clarify to avoid any ongoing misunderstanding. My focus is on keeping communication constructive and ensuring we’re aligned.

I’d appreciate hearing your perspective so we can move forward smoothly.
Respectfully, 
[Your Name]`
    },
    {
      id: 68,
      title: 'Polite Decline',
      category: 'conflict-resolution',
      content: `Dear [Name], thank you for considering me for [opportunity/request]. After reviewing, I’ll need to decline at this time to maintain balance with existing commitments. I truly value being thought of and hope we’ll find a way to collaborate in the future.

Wishing you the very best with this endeavor.
Sincerely,
 [Your Name]`
    },
    {
      id: 69,
      title: 'Addressing Missed Deadline',
      category: 'conflict-resolution',
      content: `Hi [Name], I noticed that [deliverable/task] hasn’t been completed by the expected date. I completely understand that unexpected challenges can arise, and my main priority is to help us stay on track without added pressure. If there are obstacles you’re facing, let’s review them together and identify the best way forward. Your input is important, and I appreciate your effort in keeping things moving smoothly. A quick update will help us realign and avoid further delays.

Best regards,
[Your Name]`
    },
    {
      id: 70,
      title: 'De-Escalation',
      category: 'conflict-resolution',
      content: `Hello [Name], I’d like to revisit our recent exchange regarding [issue] and ensure we’re both aligned moving forward. My goal is to understand your perspective fully and work together toward a solution that feels fair and constructive for both of us. A calm, focused conversation would give us the chance to reset and clear up any misunderstandings.

Would you be open to scheduling a short discussion?
Warm regards,
[Your Name]`
    },
    {
      id: 71,
      title: 'After Event Connection',
      category: 'networking',
      content: `Hello [Name], it was a pleasure meeting you at [event]. Our conversation about [topic] really stood out, and I’d love to continue building on it. I believe there could be opportunities for us to exchange insights or even collaborate down the line.

Looking forward to staying connected.
Best regards, 
[Your Name]`
    },
    {
      id: 72,
      title: 'New Connection Outreach',
      category: 'networking',
      content: `Hi [Name], I recently came across your work in [field/industry], and it resonated strongly with my interests. I’d like to connect and learn more about your perspective on [topic]. Building relationships with thoughtful professionals is always rewarding.

Hope we can connect soon.
Sincerely, 
[Your Name]`
    },
    {
      id: 73,
      title: 'Reconnecting',
      category: 'networking',
      content: `Hello [Name], it’s been a while since we last connected, and I wanted to check back in. I’ve been working on [project/initiative] and thought of you given your expertise. I’d enjoy hearing what you’ve been up to and sharing some updates as well.

Would you be open to a quick catch-up?
Kind regards, 
[Your Name]`
    },
    {
      id: 74,
      title: 'Touching Base Without Agenda',
      category: 'networking',
      content: `Hi [Name], I hope this message finds you well. I just wanted to take a moment to reconnect and check in—sometimes the best conversations happen without a specific agenda. If there’s anything you’re working on where an extra perspective or bit of support could help, please feel free to share.

It’s always a pleasure to stay in touch, and I look forward to hearing what’s new on your end whenever you have a moment.
Warm regards,
[Your Name]`
    },
    {
      id: 75,
      title: 'Declining a Meeting',
      category: 'professional-declines',
      content: `Hi [Name], thank you for inviting me to meet regarding [topic]. I truly appreciate you thinking of me. At the moment, my schedule is fully committed, and I wouldn’t be able to give the conversation the focus it deserves. Rather than rushing through it, I’d prefer to revisit this when I have clearer availability.
Please feel free to share any key points by message in the meantime.
Warm regards,
[Your Name]`
    },
    {
      id: 76,
      title: 'Declining a Request',
      category: 'professional-declines',
      content: `Hello [Name], thank you for reaching out and considering me for [request/task]. I’m honored you thought of me. Unfortunately, I’m not able to take this on right now due to existing priorities that require my full attention. I prefer to be upfront rather than overpromise and underdeliver.
I hope you understand, and I’m wishing you success as you move forward.
Best,
[Your Name]
`
    },
    {
      id: 77,
      title: 'Declining an Opportunity',
      category: 'professional-declines',
      content: `Hi [Name], I appreciate you offering me the opportunity to be part of [project/team/event]. It means a lot to be considered. After thinking it through, I realized I won’t be able to commit at this time. I want to make sure anything I take on gets the level of engagement it deserves, and my current workload won’t allow that.
Thank you again for the invitation—it truly was appreciated.
Kindly,
[Your Name]`
    },
    {
      id: 78,
      title: 'Declining Due to Misalignment',
      category: 'professional-declines',
      content: `Hi [Name], thanks so much for presenting the idea about [proposal/topic]. I took some time to review it, and while I see the value, it’s not fully aligned with my current direction and goals. I believe it’s important to stay focused, so I won’t be moving forward with this one.
I genuinely appreciate you thinking of me and wish you the best as you continue with it.
Warm regards,
[Your Name]`
    }
  ];

  // Map each template category to a dashboard section with a specific color
  const mapCategoryToSection = (category) => {
    // Sections and colors requested by you
    const SECTION_COLORS = {
      UPCOMING: '#81C784',       // Fresh Mint
      DUE_TODAY: '#FFB74D',      // Warm Amber
      LATE: '#E57373',           // Soft Red
      FOLLOW_UPS: '#64B5F6',     // Medium Sky Blue
      HIGH_PRIORITY: '#F06292',  // Deep Coral
    };

    // Heuristic mapping from template category → dashboard section
    switch (category) {
      case 'professional-follow-up':
      case 'customer-feedback':
      case 'peer-communication':
      case 'teacher-parent':
      case 'consultant-outreach':
      case 'networking':
        return { label: 'Follow-Ups Tasks', color: SECTION_COLORS.FOLLOW_UPS };

      case 'deadline-reminder':
      case 'internal-team':
      case 'service-project-update':
      case 'event-invitation':
      case 'interview':
        return { label: 'Upcoming Tasks', color: SECTION_COLORS.UPCOMING };

      case 'appointment-reminder':
        return { label: 'Due Today Tasks', color: SECTION_COLORS.DUE_TODAY };

      case 'payment-request':
        return { label: 'Late Tasks', color: SECTION_COLORS.LATE };

      case 'conflict-resolution':
      case 'sales-copy':
        return { label: 'High Priority Tasks', color: SECTION_COLORS.HIGH_PRIORITY };

      case 'thank-you':
      default:
        // Default to Follow-Ups for miscellaneous templates
        return { label: 'Follow-Ups Tasks', color: SECTION_COLORS.FOLLOW_UPS };
    }
  };

  const toggleCategory = (categoryValue) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryValue]: !prev[categoryValue]
    }));
  };

  const groupedTemplates = templateCategories.reduce((acc, category) => {
    if (category.value === 'all') return acc;
    const categoryTemplates = templates.filter(t => t.category === category.value);
    if (categoryTemplates.length > 0) {
      acc[category.value] = {
        label: category.label,
        templates: categoryTemplates
      };
    }
    return acc;
  }, {});

  const copyToClipboard = async (content, title) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(content);
      } else {
        throw new Error('Clipboard API not available');
      }
    } catch (err) {
      // Fallback: create a hidden textarea, select, and copy
      const textArea = document.createElement('textarea');
      textArea.value = content;
      textArea.style.position = 'fixed';
      textArea.style.top = '-1000px';
      textArea.style.left = '-1000px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
      } finally {
        document.body.removeChild(textArea);
      }
    }
    setCopySuccess(`"${title}" copied to clipboard!`);
    setTimeout(() => setCopySuccess(''), 3000);
  };

  return (
    <div className="meeting-templates-page">
      <div className="templates-header">
        <h1>Communication Templates</h1>
        <p className="header-intro">
          Ever get stuck—or forget what to say—professionally?
        </p>
        <p className="header-description">
          Don't Forget has you covered. These done-for-you communication templates help you say it right every time. 
          Just copy, paste, and fill in the blanks to add your personal touch for emails, texts, or messages that 
          help you sound clear, confident, and professional.
        </p>
        <p className="header-tagline">Thank me later.</p>
      </div>

      {copySuccess && (
        <div className="copy-success">
          {copySuccess}
        </div>
      )}

      <div className="templates-accordion">
        {Object.entries(groupedTemplates).map(([categoryValue, categoryData]) => {
          const isExpanded = expandedCategories[categoryValue];
          return (
            <div key={categoryValue} className="accordion-item">
              <button 
                className="accordion-header"
                onClick={() => toggleCategory(categoryValue)}
                aria-expanded={isExpanded}
              >
                <span className="accordion-title">{categoryData.label}</span>
                <span className="accordion-icon">
                  {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </button>
              
              {isExpanded && (
                <div className="accordion-content">
                  <div className="templates-grid">
                    {categoryData.templates.map(template => (
                      <div key={template.id} className="template-card">
                        <div className="template-header">
                          <h3>{template.title}</h3>
                          <button 
                            type="button"
                            className="copy-btn"
                            onClick={(e) => { 
                              e.preventDefault(); 
                              e.stopPropagation(); 
                              copyToClipboard(template.content, template.title); 
                            }}
                            aria-label={`Copy template: ${template.title}`}
                          >
                            <FaCopy className="copy-icon" />
                            Copy
                          </button>
                        </div>
                        <div className="template-content">
                          <p>{template.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MeetingTemplates;

