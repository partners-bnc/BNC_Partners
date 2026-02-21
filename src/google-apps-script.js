// Google Apps Script Code - Deploy as Web App

function doGet(e) {
  try {
    console.log('GET request received:', e);
    console.log('Parameters:', e.parameter);
    
    const data = e.parameter;
    const action = data.action;
    
    console.log('Action:', action);
    console.log('Data received:', data);
    
    if (action === 'register') {
      return handleRegistration(data);
    } else if (action === 'login') {
      return handleLogin(data);
    } else if (action === 'adminLogin') {
      return handleAdminLogin(data);
    } else if (action === 'getAdminData') {
      return getAdminData(data);
    } else if (action === 'checkEmail') {
      return checkEmailExists(data);
    } else if (action === 'getPartnerData') {
      return getPartnerData(data);
    } else if (action === 'getServiceData') {
      return getServiceData(data);
    } else if (action === 'submitAIProfile') {
      return submitAIProfile(data);
    } else if (action === 'submitEnquiry') {
      return submitEnquiry(data);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({success: false, message: 'Invalid action'}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error in doGet:', error);
    return ContentService
      .createTextOutput(JSON.stringify({success: false, message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    console.log('Received request:', e);
    console.log('Parameters:', e.parameter);
    
    const data = e.parameter; // For FormData
    const action = data.action;
    
    console.log('Action:', action);
    console.log('Data received:', data);
    
    if (action === 'register') {
      return handleRegistration(data);
    } else if (action === 'login') {
      return handleLogin(data);
    } else if (action === 'submitEnquiry') {
      return submitEnquiry(data);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({success: false, message: 'Invalid action'}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error in doPost:', error);
    return ContentService
      .createTextOutput(JSON.stringify({success: false, message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function submitEnquiry(data) {
  try {
    const ss = SpreadsheetApp.openById('1Tds1b8C3VDj1aS5J41Wal7oNknDNaoIJSZEcsCBOyss');
    const sheetName = 'Enquiry form';
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow([
        'Timestamp',
        'Country',
        'Country Label',
        'Service',
        'Form Type',
        'Full Name',
        'Email',
        'Phone',
        'Company',
        'Message'
      ]);
    }

    const timestamp = new Date();
    sheet.appendRow([
      timestamp,
      data.country || '',
      data.countryLabel || '',
      data.service || '',
      data.formType || '',
      data.name || '',
      data.email || '',
      data.phone || '',
      data.company || '',
      data.message || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Enquiry submitted' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error('Error in submitEnquiry:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: 'Enquiry submission failed: ' + error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleRegistration(data) {
  try {
    console.log('Starting registration process');
    const sheet = SpreadsheetApp.openById('1Tds1b8C3VDj1aS5J41Wal7oNknDNaoIJSZEcsCBOyss').getSheetByName('Partner Form');
    console.log('Sheet accessed successfully');
    
    // Check if email already exists
    const emailColumn = sheet.getRange('D:D').getValues();
    for (let i = 1; i < emailColumn.length; i++) {
      if (emailColumn[i][0] === data.email) {
        console.log('Email already exists:', data.email);
        return ContentService
          .createTextOutput(JSON.stringify({success: false, message: 'Email already registered'}))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // Append new registration
    const timestamp = new Date();
    const newRow = [
      timestamp,
      data.firstName || '',
      data.lastName || '',
      data.email || '',
      data.phone || '',
      data.country || '',
      data.city || '',
      data.password || '',
      'Pending', // Status
      '', // Notes
      timestamp // Registration Date
    ];
    
    console.log('Appending row:', newRow);
    sheet.appendRow(newRow);
    console.log('Row appended successfully');
    
    return ContentService
      .createTextOutput(JSON.stringify({success: true, message: 'Registration successful'}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error in handleRegistration:', error);
    return ContentService
      .createTextOutput(JSON.stringify({success: false, message: 'Registration failed: ' + error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleLogin(data) {
  try {
    const sheet = SpreadsheetApp.openById('1Tds1b8C3VDj1aS5J41Wal7oNknDNaoIJSZEcsCBOyss').getSheetByName('Partner Form');
    const dataRange = sheet.getDataRange().getValues();
    
    // Skip header row, check from row 2
    for (let i = 1; i < dataRange.length; i++) {
      const row = dataRange[i];
      const email = row[3]; // Column D (Email)
      const password = row[7]; // Column H (Password)
      
      if (email === data.email && password === data.password) {
        return ContentService
          .createTextOutput(JSON.stringify({
            success: true, 
            message: 'Login successful',
            user: {
              firstName: row[1],
              lastName: row[2],
              email: row[3],
              phone: row[4],
              country: row[5],
              city: row[6],
              status: row[8]
            }
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({success: false, message: 'Invalid email or password'}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error in handleLogin:', error);
    return ContentService
      .createTextOutput(JSON.stringify({success: false, message: 'Login failed: ' + error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function setupSheet() {
  try {
    // Run this once to setup the sheet headers
    const sheet = SpreadsheetApp.openById('1Tds1b8C3VDj1aS5J41Wal7oNknDNaoIJSZEcsCBOyss').getSheetByName('Partner Form');
    const headers = [
      'Timestamp',
      'First Name', 
      'Last Name',
      'Email',
      'Phone',
      'Country',
      'City',
      'Password',
      'Status',
      'Notes',
      'Registration Date'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    console.log('Sheet setup completed');
  } catch (error) {
    console.error('Error in setupSheet:', error);
  }
}

function checkEmailExists(data) {
  try {
    const sheet = SpreadsheetApp.openById('1Tds1b8C3VDj1aS5J41Wal7oNknDNaoIJSZEcsCBOyss').getSheetByName('Partner Form');
    const emailColumn = sheet.getRange('D:D').getValues();
    
    for (let i = 1; i < emailColumn.length; i++) {
      if (emailColumn[i][0] === data.email) {
        return ContentService
          .createTextOutput(JSON.stringify({success: false, exists: true, message: 'Email already exists'}))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({success: true, exists: false, message: 'Email available'}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error in checkEmailExists:', error);
    return ContentService
      .createTextOutput(JSON.stringify({success: false, message: 'Error checking email: ' + error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getPartnerData(data) {
  try {
    const sheet = SpreadsheetApp.openById('1Tds1b8C3VDj1aS5J41Wal7oNknDNaoIJSZEcsCBOyss').getSheetByName('Partner Form');
    const dataRange = sheet.getDataRange().getValues();
    
    // Skip header row, check from row 2
    for (let i = 1; i < dataRange.length; i++) {
      const row = dataRange[i];
      const email = row[3]; // Column D (Email)
      
      if (email === data.email) {
        // Check if AI Profile is completed and get bio
        let aiProfileCompleted = false;
        let bio = '';
        
        try {
          const aiProfileSheet = SpreadsheetApp.openById('1Tds1b8C3VDj1aS5J41Wal7oNknDNaoIJSZEcsCBOyss').getSheetByName('AI Profile Details');
          const aiProfileData = aiProfileSheet.getDataRange().getValues();
          
          console.log('Checking AI Profile for email:', email);
          console.log('AI Profile sheet rows:', aiProfileData.length);
          
          for (let j = 1; j < aiProfileData.length; j++) {
            const profileEmail = aiProfileData[j][1]; // Column B has email
            console.log('Row', j, 'Email in sheet:', profileEmail, 'Looking for:', email);
            
            if (profileEmail && profileEmail.toString().trim().toLowerCase() === email.toString().trim().toLowerCase()) {
              aiProfileCompleted = true;
              bio = aiProfileData[j][9] || ''; // Column J has bio (index 9)
              console.log('Match found! Bio:', bio);
              break;
            }
          }
          
          console.log('Final result - AI Profile Completed:', aiProfileCompleted, 'Bio:', bio);
        } catch (error) {
          console.error('Error fetching AI Profile data:', error);
        }
        
        return ContentService
          .createTextOutput(JSON.stringify({
            success: true,
            data: {
              timestamp: row[0],
              firstName: row[1],
              lastName: row[2],
              email: row[3],
              phone: row[4],
              country: row[5],
              city: row[6],
              status: row[8],
              notes: row[9],
              registrationDate: row[10],
              aiProfileCompleted: aiProfileCompleted,
              bio: bio
            }
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({success: false, message: 'Partner not found'}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error in getPartnerData:', error);
    return ContentService
      .createTextOutput(JSON.stringify({success: false, message: 'Error fetching partner data: ' + error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function submitAIProfile(data) {
  try {
    const sheet = SpreadsheetApp.openById('1Tds1b8C3VDj1aS5J41Wal7oNknDNaoIJSZEcsCBOyss').getSheetByName('AI Profile Details');
    
    let experienceYears = data.experienceYears || '';
    let organisationName = data.organisationName || '';
    try {
      if (data.experienceDetails) {
        const details = JSON.parse(data.experienceDetails);
        const industries = Object.keys(details || {});
        experienceYears = industries
          .map(industry => `${industry.replace(/-/g, ' ')}: ${details[industry]?.years || ''}`)
          .join(', ');
        organisationName = industries
          .map(industry => `${industry.replace(/-/g, ' ')}: ${details[industry]?.organisationName || ''}`)
          .join(', ');
      }
    } catch (parseError) {
      console.error('Error parsing experienceDetails:', parseError);
    }

    const timestamp = new Date();
    const newRow = [
      timestamp, // A: Timestamp
      data.email, // B: Email
      data.partnerType, // C: Partner Type
      data.services, // D: Services (comma separated)
      data.industries, // E: Industries (comma separated)
      data.experienceIndustries, // F: Experience Industries (comma separated)
      experienceYears, // G: Experience Years
      organisationName, // H: Organisation Name
      data.bio // I: Bio
    ];
    
    sheet.appendRow(newRow);
    
    return ContentService
      .createTextOutput(JSON.stringify({success: true, message: 'AI Profile submitted successfully'}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error in submitAIProfile:', error);
    return ContentService
      .createTextOutput(JSON.stringify({success: false, message: 'AI Profile submission failed: ' + error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleAdminLogin(data) {
  try {
    const sheet = SpreadsheetApp.openById('1Tds1b8C3VDj1aS5J41Wal7oNknDNaoIJSZEcsCBOyss').getSheetByName('Admin');
    const dataRange = sheet.getDataRange().getValues();
    
    for (let i = 1; i < dataRange.length; i++) {
      const row = dataRange[i];
      const adminId = row[0]; // Column A (Admin ID)
      const password = row[1]; // Column B (Password)
      
      if (adminId === data.adminId && password === data.password) {
        return ContentService
          .createTextOutput(JSON.stringify({
            success: true, 
            message: 'Admin login successful',
            admin: {
              adminId: adminId
            }
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({success: false, message: 'Invalid admin credentials'}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error in handleAdminLogin:', error);
    return ContentService
      .createTextOutput(JSON.stringify({success: false, message: 'Admin login failed: ' + error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getServiceData(data) {
  try {
    console.log('getServiceData called with email:', data.email);
    const sheet = SpreadsheetApp.openById('1Tds1b8C3VDj1aS5J41Wal7oNknDNaoIJSZEcsCBOyss').getSheetByName('AI Profile Details');
    const dataRange = sheet.getDataRange().getValues();
    
    console.log('AI Profile sheet rows:', dataRange.length);
    
    // Skip header row, check from row 2
    for (let i = 1; i < dataRange.length; i++) {
      const row = dataRange[i];
      const email = row[1]; // Column B (Email)
      
      console.log('Checking row', i, 'email:', email, 'against:', data.email);
      
      if (email && email.toString().trim().toLowerCase() === data.email.toString().trim().toLowerCase()) {
        console.log('Match found! Returning service data');
        return ContentService
          .createTextOutput(JSON.stringify({
            success: true,
            data: {
              partnerType: row[2] || '',
              services: row[3] || '',
              industries: row[4] || '',
              experienceIndustries: row[5] || '',
              experienceYears: row[6] || '',
              organisationName: row[7] || '',
              bio: row[8] || ''
            }
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    console.log('No matching email found');
    return ContentService
      .createTextOutput(JSON.stringify({success: false, message: 'Service data not found'}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error in getServiceData:', error);
    return ContentService
      .createTextOutput(JSON.stringify({success: false, message: 'Error fetching service data: ' + error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getAdminData() {
  try {
    const partnerSheet = SpreadsheetApp.openById('1Tds1b8C3VDj1aS5J41Wal7oNknDNaoIJSZEcsCBOyss').getSheetByName('Partner Form');
    const aiProfileSheet = SpreadsheetApp.openById('1Tds1b8C3VDj1aS5J41Wal7oNknDNaoIJSZEcsCBOyss').getSheetByName('AI Profile Details');
    
    const partnerData = partnerSheet.getDataRange().getValues();
    const aiProfileData = aiProfileSheet.getDataRange().getValues();
    
    const partners = [];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    let thisMonthCount = 0;
    
    // Process partner data (skip header row)
    for (let i = 1; i < partnerData.length; i++) {
      const row = partnerData[i];
      const email = row[3];
      const registrationDate = new Date(row[0]);
      
      // Check if AI Profile completed
      let aiProfileCompleted = false;
      for (let j = 1; j < aiProfileData.length; j++) {
        if (aiProfileData[j][1] === email) {
          aiProfileCompleted = true;
          break;
        }
      }
      
      // Count this month registrations
      if (registrationDate.getMonth() === currentMonth && registrationDate.getFullYear() === currentYear) {
        thisMonthCount++;
      }
      
      partners.push({
        name: `${row[1]} ${row[2]}`,
        email: row[3],
        phone: row[4],
        country: row[5],
        city: row[6],
        status: aiProfileCompleted ? 'Complete' : 'Pending',
        registrationDate: row[0]
      });
    }
    
    const totalPartners = partners.length;
    const activePartners = partners.filter(p => p.status === 'Complete').length;
    const pendingPartners = partners.filter(p => p.status === 'Pending').length;
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        data: {
          kpis: {
            totalPartners,
            activePartners,
            pendingPartners,
            thisMonth: thisMonthCount
          },
          partners
        }
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error in getAdminData:', error);
    return ContentService
      .createTextOutput(JSON.stringify({success: false, message: 'Error fetching admin data: ' + error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
