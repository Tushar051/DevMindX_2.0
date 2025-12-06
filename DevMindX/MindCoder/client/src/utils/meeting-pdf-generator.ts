import type { MeetingData } from '../types/meeting';

export function generateMeetingPDF(meetingData: MeetingData): void {
  const { jsPDF } = (window as any).jspdf || {};
  
  // If jsPDF is not available, use HTML-based PDF generation
  if (!jsPDF) {
    generateHTMLPDF(meetingData);
    return;
  }
  
  const doc = new jsPDF();
  let yPos = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  
  // Helper function to add new page if needed
  const checkPageBreak = (height: number) => {
    if (yPos + height > 280) {
      doc.addPage();
      yPos = 20;
    }
  };
  
  // Title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Meeting Summary Report', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;
  
  // Meeting title
  doc.setFontSize(16);
  doc.text(meetingData.title, pageWidth / 2, yPos, { align: 'center' });
  yPos += 20;
  
  // Meeting details section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Meeting Details', margin, yPos);
  yPos += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const formatDate = (date: Date) => new Date(date).toLocaleString();
  const duration = meetingData.endTime 
    ? Math.round((new Date(meetingData.endTime).getTime() - new Date(meetingData.startTime).getTime()) / 60000)
    : 'Ongoing';
  
  const details = [
    `Meeting ID: ${meetingData.id}`,
    `Host: ${meetingData.hostName}`,
    `Start Time: ${formatDate(meetingData.startTime)}`,
    `End Time: ${meetingData.endTime ? formatDate(meetingData.endTime) : 'Ongoing'}`,
    `Duration: ${typeof duration === 'number' ? `${duration} minutes` : duration}`,
    `Total Participants: ${meetingData.participants.length}`
  ];
  
  details.forEach(detail => {
    doc.text(detail, margin, yPos);
    yPos += 6;
  });
  yPos += 10;
  
  // Participants section
  checkPageBreak(50);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Participants', margin, yPos);
  yPos += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  meetingData.participants.forEach((participant, index) => {
    checkPageBreak(15);
    const joinTime = formatDate(participant.joinedAt);
    const leftTime = participant.leftAt ? formatDate(participant.leftAt) : 'Still in meeting';
    const participantDuration = participant.leftAt
      ? Math.round((new Date(participant.leftAt).getTime() - new Date(participant.joinedAt).getTime()) / 60000)
      : 'N/A';
    
    doc.text(`${index + 1}. ${participant.username}`, margin + 5, yPos);
    yPos += 5;
    doc.setFontSize(9);
    doc.text(`   Joined: ${joinTime} | Left: ${leftTime} | Duration: ${participantDuration} min`, margin + 5, yPos);
    doc.setFontSize(10);
    yPos += 8;
  });
  yPos += 10;
  
  // File Activities section
  if (meetingData.fileActivities.length > 0) {
    checkPageBreak(50);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('File Activities', margin, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Group by type
    const created = meetingData.fileActivities.filter(a => a.type === 'created');
    const updated = meetingData.fileActivities.filter(a => a.type === 'updated');
    const deleted = meetingData.fileActivities.filter(a => a.type === 'deleted');
    
    if (created.length > 0) {
      checkPageBreak(20);
      doc.setFont('helvetica', 'bold');
      doc.text(`Files Created (${created.length}):`, margin + 5, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 6;
      created.forEach(activity => {
        checkPageBreak(10);
        doc.text(`• ${activity.fileName} - by ${activity.username} at ${formatDate(activity.timestamp)}`, margin + 10, yPos);
        yPos += 5;
      });
      yPos += 5;
    }
    
    if (updated.length > 0) {
      checkPageBreak(20);
      doc.setFont('helvetica', 'bold');
      doc.text(`Files Modified (${updated.length}):`, margin + 5, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 6;
      updated.forEach(activity => {
        checkPageBreak(10);
        doc.text(`• ${activity.fileName} - by ${activity.username} at ${formatDate(activity.timestamp)}`, margin + 10, yPos);
        yPos += 5;
      });
      yPos += 5;
    }
    
    if (deleted.length > 0) {
      checkPageBreak(20);
      doc.setFont('helvetica', 'bold');
      doc.text(`Files Deleted (${deleted.length}):`, margin + 5, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 6;
      deleted.forEach(activity => {
        checkPageBreak(10);
        doc.text(`• ${activity.fileName} - by ${activity.username} at ${formatDate(activity.timestamp)}`, margin + 10, yPos);
        yPos += 5;
      });
    }
    yPos += 10;
  }
  
  // Meeting Notes section
  if (meetingData.notes.length > 0) {
    checkPageBreak(50);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Meeting Notes & Activity Log', margin, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    meetingData.notes.forEach(note => {
      checkPageBreak(15);
      const noteTime = formatDate(note.timestamp);
      const prefix = note.isAutoGenerated ? '[Auto] ' : '';
      doc.text(`${noteTime} - ${prefix}${note.author}:`, margin + 5, yPos);
      yPos += 5;
      
      // Word wrap for long notes
      const lines = doc.splitTextToSize(note.content, contentWidth - 15);
      lines.forEach((line: string) => {
        checkPageBreak(6);
        doc.text(line, margin + 10, yPos);
        yPos += 5;
      });
      yPos += 3;
    });
    yPos += 10;
  }
  
  // Chat Messages section
  if (meetingData.chatMessages.length > 0) {
    checkPageBreak(50);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Chat History', margin, yPos);
    yPos += 8;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    meetingData.chatMessages.forEach(msg => {
      checkPageBreak(12);
      const msgTime = new Date(msg.timestamp).toLocaleTimeString();
      doc.text(`[${msgTime}] ${msg.username}: ${msg.message}`, margin + 5, yPos);
      yPos += 5;
    });
  }
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Generated by DevMindX - Page ${i} of ${pageCount}`, pageWidth / 2, 290, { align: 'center' });
  }
  
  // Save the PDF
  const fileName = `meeting-summary-${meetingData.id}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

// Fallback HTML-based PDF generation
function generateHTMLPDF(meetingData: MeetingData): void {
  const formatDate = (date: Date) => new Date(date).toLocaleString();
  const duration = meetingData.endTime 
    ? Math.round((new Date(meetingData.endTime).getTime() - new Date(meetingData.startTime).getTime()) / 60000)
    : 'Ongoing';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Meeting Summary - ${meetingData.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #333; }
    h1 { text-align: center; color: #1a1a2e; margin-bottom: 10px; font-size: 28px; }
    h2 { text-align: center; color: #4a4a6a; margin-bottom: 30px; font-size: 18px; font-weight: normal; }
    h3 { color: #1a1a2e; border-bottom: 2px solid #6366f1; padding-bottom: 8px; margin: 25px 0 15px 0; font-size: 16px; }
    .details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .details p { margin: 8px 0; font-size: 14px; }
    .details strong { color: #1a1a2e; }
    .participant { background: #fff; border: 1px solid #e0e0e0; padding: 12px 15px; margin: 8px 0; border-radius: 6px; }
    .participant-name { font-weight: bold; color: #1a1a2e; }
    .participant-time { font-size: 12px; color: #666; margin-top: 4px; }
    .activity { padding: 8px 0; border-bottom: 1px solid #eee; font-size: 13px; }
    .activity:last-child { border-bottom: none; }
    .activity-type { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; margin-right: 8px; }
    .created { background: #d4edda; color: #155724; }
    .updated { background: #fff3cd; color: #856404; }
    .deleted { background: #f8d7da; color: #721c24; }
    .note { background: #f0f0f5; padding: 12px; margin: 8px 0; border-radius: 6px; border-left: 4px solid #6366f1; }
    .note-meta { font-size: 11px; color: #666; margin-bottom: 5px; }
    .note-content { font-size: 13px; }
    .auto-note { border-left-color: #10b981; background: #ecfdf5; }
    .chat { font-size: 12px; padding: 6px 0; border-bottom: 1px solid #f0f0f0; }
    .chat-time { color: #999; }
    .chat-user { font-weight: bold; color: #6366f1; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>Meeting Summary Report</h1>
  <h2>${meetingData.title}</h2>
  
  <div class="details">
    <p><strong>Meeting ID:</strong> ${meetingData.id}</p>
    <p><strong>Host:</strong> ${meetingData.hostName}</p>
    <p><strong>Start Time:</strong> ${formatDate(meetingData.startTime)}</p>
    <p><strong>End Time:</strong> ${meetingData.endTime ? formatDate(meetingData.endTime) : 'Ongoing'}</p>
    <p><strong>Duration:</strong> ${typeof duration === 'number' ? `${duration} minutes` : duration}</p>
    <p><strong>Total Participants:</strong> ${meetingData.participants.length}</p>
  </div>
  
  <h3>👥 Participants (${meetingData.participants.length})</h3>
  ${meetingData.participants.map(p => `
    <div class="participant">
      <div class="participant-name">${p.username}</div>
      <div class="participant-time">
        Joined: ${formatDate(p.joinedAt)} | 
        Left: ${p.leftAt ? formatDate(p.leftAt) : 'Still in meeting'} |
        Duration: ${p.leftAt ? Math.round((new Date(p.leftAt).getTime() - new Date(p.joinedAt).getTime()) / 60000) + ' min' : 'N/A'}
      </div>
    </div>
  `).join('')}
  
  ${meetingData.fileActivities.length > 0 ? `
    <h3>📁 File Activities (${meetingData.fileActivities.length})</h3>
    ${meetingData.fileActivities.map(a => `
      <div class="activity">
        <span class="activity-type ${a.type}">${a.type.toUpperCase()}</span>
        <strong>${a.fileName}</strong> by ${a.username} at ${formatDate(a.timestamp)}
      </div>
    `).join('')}
  ` : ''}
  
  ${meetingData.notes.length > 0 ? `
    <h3>📝 Meeting Notes & Activity Log (${meetingData.notes.length})</h3>
    ${meetingData.notes.map(n => `
      <div class="note ${n.isAutoGenerated ? 'auto-note' : ''}">
        <div class="note-meta">${formatDate(n.timestamp)} - ${n.isAutoGenerated ? '[Auto] ' : ''}${n.author}</div>
        <div class="note-content">${n.content}</div>
      </div>
    `).join('')}
  ` : ''}
  
  ${meetingData.chatMessages.length > 0 ? `
    <h3>💬 Chat History (${meetingData.chatMessages.length} messages)</h3>
    ${meetingData.chatMessages.map(m => `
      <div class="chat">
        <span class="chat-time">[${new Date(m.timestamp).toLocaleTimeString()}]</span>
        <span class="chat-user">${m.username}:</span> ${m.message}
      </div>
    `).join('')}
  ` : ''}
  
  <div class="footer">
    Generated by DevMindX Collaboration Platform<br>
    ${new Date().toLocaleString()}
  </div>
</body>
</html>`;

  // Open in new window for printing/saving as PDF
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

export function downloadMeetingJSON(meetingData: MeetingData): void {
  const dataStr = JSON.stringify(meetingData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `meeting-data-${meetingData.id}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
