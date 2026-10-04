import { useState, useEffect, useRef } from 'react';
import { MdCheckCircle, MdError, MdSchedule, MdSend, MdSearch } from 'react-icons/md';
import './Newsletter.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function Newsletter() {
  const [activeTab, setActiveTab] = useState('send');
  const [sendMode, setSendMode] = useState('students'); // students, alumni, custom
  const [emailFormat, setEmailFormat] = useState('template'); // template, custom

  // Send Newsletter State
  const [students, setStudents] = useState([]);
  const [alumni, setAlumni] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [subject, setSubject] = useState('RE: OFFICIAL STUDENT LETTER');
  const [customBody, setCustomBody] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [customAdmissionNumber, setCustomAdmissionNumber] = useState('');
  const [customCourseName, setCustomCourseName] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminTitle, setAdminTitle] = useState('');
  const [adminSignature, setAdminSignature] = useState(() => {
    return localStorage.getItem('adminSignature') || '';
  });
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [nextRefStart, setNextRefStart] = useState(null);
  const [signatureUploading, setSignatureUploading] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);
  const [sendResults, setSendResults] = useState([]);

  // Email History State
  const [emailHistory, setEmailHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmail, setSelectedEmail] = useState(null);

  // Fetch students and alumni on mount
  useEffect(() => {
    fetchRecipients();
    fetchNextRef();
    if (activeTab === 'history') {
      fetchEmailHistory();
    }
  }, [activeTab]);

  const formatRefNumber = (seq) => {
    if (!seq && seq !== 0) return 'ATC/STU/___';
    return `ATC/STU/${String(seq).padStart(3, '0')}`;
  };

  const fetchRecipients = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token || ''}`,
        'adminId': user.id || ''
      };

      const [studentsRes, alumniRes] = await Promise.all([
        fetch(`${API_URL}/newsletter/students-list`, { headers }),
        fetch(`${API_URL}/newsletter/alumni-list`, { headers })
      ]);

      if (studentsRes.ok) setStudents(await studentsRes.json());
      if (alumniRes.ok) setAlumni(await alumniRes.json());
    } catch (error) {
      console.error('Error fetching recipients:', error);
    }
  };

  const fetchNextRef = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token || ''}`,
        'adminId': user.id || ''
      };

      const res = await fetch(`${API_URL}/newsletter/next-ref`, { headers });
      if (res.ok) {
        const data = await res.json();
        setNextRefStart(data.nextRefStart);
        return data.nextRefStart;
      }
    } catch (error) {
      console.error('Error fetching next ref:', error);
    }
    return null;
  };

  const uploadSignature = async (imageData) => {
    try {
      setSignatureUploading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token || ''}`,
        'adminId': user.id || ''
      };

      const res = await fetch(`${API_URL}/newsletter/signature`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ imageData })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Signature upload failed');
      }

      setAdminSignature(data.signatureUrl);
      localStorage.setItem('adminSignature', data.signatureUrl);
      return data.signatureUrl;
    } catch (error) {
      alert(error.message || 'Signature upload failed');
      return null;
    } finally {
      setSignatureUploading(false);
    }
  };

  const fetchEmailHistory = async () => {
    setHistoryLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token || ''}`,
        'adminId': user.id || ''
      };

      const params = new URLSearchParams({
        page: currentPage,
        ...(filterStatus && { status: filterStatus }),
        ...(dateRange.startDate && { startDate: dateRange.startDate }),
        ...(dateRange.endDate && { endDate: dateRange.endDate })
      });

      const res = await fetch(`${API_URL}/newsletter/history?${params}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setEmailHistory(data.emails);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const generateTemplateBody = (recipient, refOverride) => {
    const formatDate = (dateValue) => {
      if (!dateValue) return '_______________';
      const date = new Date(dateValue);
      if (Number.isNaN(date.getTime())) return '_______________';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const startDate = formatDate(recipient.startDate);
    const endDate = recipient.endDate ? formatDate(recipient.endDate) : null;
    const courseDurationStr = recipient.courseDuration ? recipient.courseDuration : 'N/A';
    const refValue = refOverride || recipient.refNumber || formatRefNumber(nextRefStart || 0);
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; }
        .content { text-align: justify; }
        .signature { margin-top: 40px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h3>Hospitality Competence Center Africa</h3>
            <p><strong>Official Student Confirmation Letter</strong></p>
        </div>

        <div class="content">
            <p><strong>REF:</strong> ${refValue}</p>
            <p><strong>RE:</strong> OFFICIAL STUDENT LETTER</p>

            <p>This letter is to formally confirm that <strong>${recipient.name}</strong>, 
            ID/Admission No. <strong>${recipient.admissionNumber}</strong>, is a registered student at Hospitality Competence Center Africa.</p>

            <p>The student is currently enrolled in the <strong>${recipient.courseName}</strong> program, 
            which commenced on <strong>${startDate}</strong> and is scheduled to end on <strong>${endDate || `Duration: ${courseDurationStr}`}</strong>.</p>

            <p>Hospitality Competence Center Africa is a professional skills development institution specializing in coffee, beverage, and hospitality training, 
            equipping learners with practical, industry-relevant competencies.</p>

            <p>This letter is issued upon the student's request for official purposes, including but not limited to attachment, internship, 
            identification, sponsorship, or institutional reference.</p>

            <p>Should you require any further information or verification, please do not hesitate to contact our office.</p>

            <p>Yours faithfully,</p>

            <div class="signature">
                ${adminSignature ? `<div style="margin-bottom: 10px;"><img src="${adminSignature}" style="max-width: 200px; height: auto;" /></div>` : '<p>______________________________</p>'}
                <p><strong>Name:</strong> ${adminName || '________________________'}</p>
                <p><strong>Title:</strong> ${adminTitle || '________________________'}</p>
                <p><strong>For:</strong> Hospitality Competence Center Africa</p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
  };

  const handleSendBatch = async () => {
    if (selectedRecipients.length === 0) {
      alert('Please select at least one recipient');
      return;
    }

    if (!subject) {
      alert('Please enter email subject');
      return;
    }

    if (emailFormat === 'custom' && !customBody) {
      alert('Please provide email body');
      return;
    }

    setLoading(true);
    setSendResults([]);
    setSendStatus('sending');

    try {
      const recipients = selectedRecipients.map(id => {
        const list = sendMode === 'students' ? students : alumni;
        return list.find(item => item._id === id);
      });

      let refStart = nextRefStart;
      if (!refStart) {
        refStart = await fetchNextRef();
      }
      const safeRefStart = refStart || 1;

      const recipientsPayload = emailFormat === 'template'
        ? recipients.map((recipient, index) => ({
            email: recipient.email,
            name: recipient.name,
            refNumber: formatRefNumber(safeRefStart + index),
            body: generateTemplateBody({
              ...recipient,
              refNumber: formatRefNumber(safeRefStart + index)
            }, formatRefNumber(safeRefStart + index))
          }))
        : recipients.map(recipient => ({
            email: recipient.email,
            name: recipient.name
          }));

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token || ''}`,
        'adminId': user.id || ''
      };

      const res = await fetch(`${API_URL}/newsletter/send-batch`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          recipients: recipientsPayload,
          emailType: emailFormat,
          subject,
          body: emailFormat === 'custom' ? customBody : null,
          templateData: emailFormat === 'template' ? { adminName, adminTitle, adminSignature } : null
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        setSendStatus('success');
        setSendResults(data.sentEmails);
        setSubject('RE: OFFICIAL STUDENT LETTER');
        setCustomBody('');
        setSelectedRecipients([]);
        fetchNextRef();
      } else {
        setSendStatus('error');
        alert('Error: ' + data.error);
      }
    } catch (error) {
      setSendStatus('error');
      alert('Error sending emails: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCustom = async () => {
    if (!customEmail) {
      alert('Please enter recipient email');
      return;
    }
    if (!subject) {
      alert('Please enter email subject');
      return;
    }
    if (emailFormat === 'custom' && !customBody) {
      alert('Please provide email body');
      return;
    }

    if (emailFormat === 'template') {
      if (!customName || !customAdmissionNumber || !customCourseName || !customStartDate || !customEndDate) {
        alert('Please fill all template fields (Name, Admission Number, Course, Start Date, End Date)');
        return;
      }
    }

    setLoading(true);
    setSendResults([]);
    setSendStatus('sending');

    try {
      let refStart = nextRefStart;
      if (!refStart) {
        refStart = await fetchNextRef();
      }
      const refNumber = formatRefNumber(refStart || 1);

      const emailBody = emailFormat === 'template'
        ? generateTemplateBody({
            name: customName,
            admissionNumber: customAdmissionNumber,
            courseName: customCourseName,
            startDate: customStartDate,
            endDate: customEndDate,
            refNumber
          }, refNumber)
        : customBody;

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token || ''}`,
        'adminId': user.id || ''
      };

      const res = await fetch(`${API_URL}/newsletter/send-custom`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          recipientEmail: customEmail,
          recipientName: customName,
          subject,
          body: emailBody,
          emailType: emailFormat,
          templateData: emailFormat === 'template' ? { adminName, adminTitle, adminSignature, refNumber } : null
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        setSendStatus('success');
        alert('Email sent successfully!');
        setCustomEmail('');
        setCustomName('');
        setCustomAdmissionNumber('');
        setCustomCourseName('');
        setCustomStartDate('');
        setCustomEndDate('');
        setCustomBody('');
        setSubject('RE: OFFICIAL STUDENT LETTER');
        fetchNextRef();
      } else {
        setSendStatus('error');
        alert('Error: ' + data.error);
      }
    } catch (error) {
      setSendStatus('error');
      alert('Error sending email: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipients = (sendMode === 'students' ? students : alumni).filter(item =>
    item.name.toLowerCase().includes(searchText.toLowerCase()) ||
    item.email.toLowerCase().includes(searchText.toLowerCase()) ||
    item.admissionNumber.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="newsletter-container">
      <div className="newsletter-header">
        <h1>Newsletter Manager</h1>
        <p>Send newsletters and manage email communications</p>
      </div>

      <div className="newsletter-tabs">
        <button
          className={`tab-btn ${activeTab === 'send' ? 'active' : ''}`}
          onClick={() => setActiveTab('send')}
        >
          <MdSend /> Send Newsletter
        </button>
        <button
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <MdSchedule /> Email History
        </button>
      </div>

      {/* Send Newsletter Tab */}
      {activeTab === 'send' && (
        <div className="tab-content">
          <div className="send-mode-selector">
            <label>
              <input
                type="radio"
                value="students"
                checked={sendMode === 'students'}
                onChange={(e) => setSendMode(e.target.value)}
              />
              Send to Students
            </label>
            <label>
              <input
                type="radio"
                value="alumni"
                checked={sendMode === 'alumni'}
                onChange={(e) => setSendMode(e.target.value)}
              />
              Send to Alumni
            </label>
            <label>
              <input
                type="radio"
                value="custom"
                checked={sendMode === 'custom'}
                onChange={(e) => setSendMode(e.target.value)}
              />
              Send Custom Email
            </label>
          </div>

          <div className="email-format-selector">
            <label>
              <input
                type="radio"
                value="template"
                checked={emailFormat === 'template'}
                onChange={(e) => setEmailFormat(e.target.value)}
              />
              Use Standard Letter Template
            </label>
            <label>
              <input
                type="radio"
                value="custom"
                checked={emailFormat === 'custom'}
                onChange={(e) => setEmailFormat(e.target.value)}
              />
              Write Custom Message
            </label>
          </div>

          {sendMode !== 'custom' && (
            <>
              <div className="recipient-selector">
                <h3>Select Recipients (Max 10)</h3>
                <div className="search-box">
                  <MdSearch />
                  <input
                    type="text"
                    placeholder="Search by name, email, or admission number..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>

                <div className="recipient-list">
                  {filteredRecipients.map(item => (
                    <label key={item._id} className="recipient-item">
                      <input
                        type="checkbox"
                        checked={selectedRecipients.includes(item._id)}
                        onChange={(e) => {
                          if (e.target.checked && selectedRecipients.length >= 10) {
                            alert('Maximum 10 recipients allowed');
                            return;
                          }
                          setSelectedRecipients(prev =>
                            e.target.checked
                              ? [...prev, item._id]
                              : prev.filter(id => id !== item._id)
                          );
                        }}
                      />
                      <span className="name">{item.name}</span>
                      <span className="email">{item.email}</span>
                    </label>
                  ))}
                </div>

                {selectedRecipients.length > 0 && (
                  <div className="selected-count">
                    Selected: {selectedRecipients.length} / 10
                  </div>
                )}
              </div>

              <div className="email-compose">
                <input
                  type="text"
                  placeholder="Email Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="subject-input"
                />

                {emailFormat === 'template' && (
                  <>
                    <div style={{
                      padding: '10px 12px',
                      border: '1px dashed #ddd',
                      borderRadius: '6px',
                      fontSize: '13px',
                      color: '#555',
                      background: '#fafafa'
                    }}>
                      Reference Number (Auto Generated): {formatRefNumber(nextRefStart || 0)}
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <input
                        type="text"
                        placeholder="Yours Faithfully, Your Name"
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        className="ref-input"
                        style={{ flex: 1 }}
                      />
                      <input
                        type="text"
                        placeholder="Your Title/Position"
                        value={adminTitle}
                        onChange={(e) => setAdminTitle(e.target.value)}
                        className="ref-input"
                        style={{ flex: 1 }}
                      />
                    </div>
                    <button
                      onClick={() => setShowSignatureModal(true)}
                      style={{
                        padding: '10px 16px',
                        background: '#cc4400',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      {adminSignature ? '✓ Signature Captured - Click to Re-capture' : '✎ Capture Your Signature'}
                    </button>
                    <div className="template-preview">
                      <h4>Template Preview (First Recipient)</h4>
                      <iframe
                        srcDoc={selectedRecipients.length > 0 ? generateTemplateBody(
                          (sendMode === 'students' ? students : alumni).find(
                            item => item._id === selectedRecipients[0]
                          )
                        ) : '<p>Select a recipient to preview</p>'}
                        style={{ width: '100%', height: '400px', border: '1px solid #ddd', borderRadius: '8px' }}
                        title="Template Preview"
                      />
                    </div>
                  </>
                )}

                {emailFormat === 'custom' && (
                  <textarea
                    placeholder="Enter your email message (supports HTML)"
                    value={customBody}
                    onChange={(e) => setCustomBody(e.target.value)}
                    className="body-input"
                    rows="10"
                  />
                )}

                <button
                  onClick={handleSendBatch}
                  disabled={loading || selectedRecipients.length === 0 || !subject}
                  className="send-btn"
                >
                  {loading ? 'Sending...' : `Send to ${selectedRecipients.length} Recipients`}
                </button>
              </div>
            </>
          )}

          {sendMode === 'custom' && (
            <div className="custom-email-form">
              <h3>Send Custom Email</h3>
              <p className="info-text">Note: Custom emails are sent one at a time</p>

              <input
                type="email"
                placeholder="Recipient Email Address"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="custom-email-input"
              />

              <input
                type="text"
                placeholder="Recipient Name (Required for Template)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="custom-name-input"
              />

              <input
                type="text"
                placeholder="Email Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="subject-input"
              />

              {emailFormat === 'template' && (
                <>
                  <div style={{
                    padding: '10px 12px',
                    border: '1px dashed #ddd',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: '#555',
                    background: '#fafafa'
                  }}>
                    Reference Number (auto): {formatRefNumber(nextRefStart || 0)}
                  </div>
                  <input
                    type="text"
                    placeholder="Admission Number"
                    value={customAdmissionNumber}
                    onChange={(e) => setCustomAdmissionNumber(e.target.value)}
                    className="ref-input"
                  />
                  <input
                    type="text"
                    placeholder="Course Name"
                    value={customCourseName}
                    onChange={(e) => setCustomCourseName(e.target.value)}
                    className="ref-input"
                  />
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input
                      type="date"
                      placeholder="Start Date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="ref-input"
                      style={{ flex: 1 }}
                    />
                    <input
                      type="date"
                      placeholder="End Date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="ref-input"
                      style={{ flex: 1 }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="ref-input"
                      style={{ flex: 1 }}
                    />
                    <input
                      type="text"
                      placeholder="Your Title/Position"
                      value={adminTitle}
                      onChange={(e) => setAdminTitle(e.target.value)}
                      className="ref-input"
                      style={{ flex: 1 }}
                    />
                  </div>
                  <button
                    onClick={() => setShowSignatureModal(true)}
                    style={{
                      padding: '10px 16px',
                      background: '#cc4400',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    {adminSignature ? '✓ Signature Captured - Click to Re-capture' : '✎ Capture Your Signature'}
                  </button>
                  <div className="template-preview">
                    <h4>Template Preview</h4>
                    <iframe
                      srcDoc={generateTemplateBody({ 
                        name: customName || '[Student Name]',
                        admissionNumber: customAdmissionNumber || '[Admission No.]',
                        courseName: customCourseName || '[Course Name]',
                        startDate: customStartDate || new Date(),
                        endDate: customEndDate || null,
                        courseDuration: ''
                      }, formatRefNumber(nextRefStart || 0))}
                      style={{ width: '100%', height: '400px', border: '1px solid #ddd', borderRadius: '8px' }}
                      title="Template Preview"
                    />
                  </div>
                </>
              )}

              {emailFormat === 'custom' && (
                <textarea
                  placeholder="Enter your email message (supports HTML)"
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  className="body-input"
                  rows="10"
                />
              )}

              <button
                onClick={handleSendCustom}
                disabled={loading || !customEmail || !subject}
                className="send-btn"
              >
                {loading ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          )}

          {sendStatus && (
            <div className={`send-status ${sendStatus}`}>
              {sendStatus === 'success' && <MdCheckCircle />}
              {sendStatus === 'error' && <MdError />}
              {sendStatus === 'sending' && <span className="spinner" />}
              <span>
                {sendStatus === 'success' && 'Emails sent successfully!'}
                {sendStatus === 'error' && 'Error sending emails'}
                {sendStatus === 'sending' && 'Sending emails...'}
              </span>
            </div>
          )}

          {sendResults.length > 0 && (
            <div className="send-results">
              <h3>Send Results</h3>
              <div className="results-grid">
                {sendResults.map((result, idx) => (
                  <div key={idx} className="result-item success">
                    <MdCheckCircle />
                    <span>{result.recipientEmail}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Email History Tab */}
      {activeTab === 'history' && (
        <div className="tab-content">
          <div className="history-filters">
            <div className="filter-group">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                placeholder="Start Date"
              />
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                placeholder="End Date"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>
              <button onClick={fetchEmailHistory} disabled={historyLoading}>
                {historyLoading ? 'Loading...' : 'Filter'}
              </button>
            </div>

            <div className="search-box">
              <MdSearch />
              <input
                type="text"
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="email-history-table">
            {emailHistory.length === 0 ? (
              <div className="empty-state">
                <p>No emails found</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Recipient</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Sent Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {emailHistory.map((email) => (
                    <tr key={email._id}>
                      <td>{email.recipientEmail}</td>
                      <td>{email.subject}</td>
                      <td>
                        <span className={`status-badge ${email.status}`}>
                          {email.status}
                        </span>
                      </td>
                      <td>{new Date(email.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          onClick={() => setSelectedEmail(email)}
                          className="view-btn"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Email Detail Modal */}
      {selectedEmail && (
        <div className="modal-overlay" onClick={() => setSelectedEmail(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedEmail(null)}>×</button>
            <h2>Email Details</h2>
            <div className="email-details">
              <p><strong>To:</strong> {selectedEmail.recipientEmail}</p>
              <p><strong>Subject:</strong> {selectedEmail.subject}</p>
              <p><strong>Status:</strong> <span className={`status-badge ${selectedEmail.status}`}>{selectedEmail.status}</span></p>
              <p><strong>Sent:</strong> {new Date(selectedEmail.createdAt).toLocaleString()}</p>
              {selectedEmail.errorMessage && (
                <p><strong>Error:</strong> {selectedEmail.errorMessage}</p>
              )}
              <div className="email-body">
                <strong>Message:</strong>
                <iframe
                  srcDoc={selectedEmail.body}
                  style={{ width: '100%', height: '300px', border: '1px solid #ddd', marginTop: '10px' }}
                  title="Email Body"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Signature Capture Modal */}
      {showSignatureModal && (
        <SignatureCaptureModal
          onClose={() => setShowSignatureModal(false)}
          onSave={async (sig) => {
            const url = await uploadSignature(sig);
            if (url) {
              setShowSignatureModal(false);
            }
          }}
          currentSignature={adminSignature}
          isUploading={signatureUploading}
        />
      )}
    </div>
  );
}

// Signature Capture Component
function SignatureCaptureModal({ onClose, onSave, currentSignature, isUploading }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;

    if (currentSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = currentSignature;
    }
  }, [currentSignature]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = async () => {
    const canvas = canvasRef.current;
    await onSave(canvas.toDataURL());
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '500px',
        width: '90%'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '16px' }}>Capture Your Signature</h2>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>Sign on the canvas below. Use your stylus or mouse.</p>
        
        <canvas
          ref={canvasRef}
          width={450}
          height={200}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          style={{
            border: '2px solid #ddd',
            borderRadius: '8px',
            cursor: 'crosshair',
            display: 'block',
            width: '100%',
            height: '200px',
            marginBottom: '16px',
            backgroundColor: 'white'
          }}
        />

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={clearCanvas}
            disabled={isUploading}
            style={{
              flex: 1,
              padding: '10px',
              background: '#f0f0f0',
              border: '1px solid #ddd',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Clear
          </button>
          <button
            onClick={onClose}
            disabled={isUploading}
            style={{
              flex: 1,
              padding: '10px',
              background: '#f0f0f0',
              border: '1px solid #ddd',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Cancel
          </button>
          <button
            onClick={saveSignature}
            disabled={isUploading}
            style={{
              flex: 1,
              padding: '10px',
              background: '#cc4400',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {isUploading ? 'Saving...' : 'Save Signature'}
          </button>
        </div>
      </div>
    </div>
  );
}
