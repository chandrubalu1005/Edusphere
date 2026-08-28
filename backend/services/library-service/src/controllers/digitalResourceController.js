const DigitalResource = require('../models/DigitalResource');
const DigitalAccessLog = require('../models/DigitalAccessLog');
const LibraryMember = require('../models/LibraryMember');
const { generatePresignedUrl } = require('../config/minio');

exports.getDigitalResources = async (req, res) => {
  try {
    const { titleId } = req.query;
    const filter = { status: 'ACTIVE' };
    if (titleId) filter.bookTitleId = titleId;

    const resources = await DigitalResource.find(filter).populate('bookTitleId');
    res.json({ success: true, data: resources });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

exports.accessResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { memberId, action } = req.body; // action: 'VIEW' or 'DOWNLOAD'

    const resource = await DigitalResource.findById(id);
    if (!resource || resource.status !== 'ACTIVE') {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Resource not found or inactive' } });
    }

    const member = await LibraryMember.findById(memberId).populate('borrowingPolicyId');
    if (!member || member.status !== 'ACTIVE') {
      await logAccess(resource._id, memberId, action, 'DENIED', 'Member inactive or not found', req);
      return res.status(403).json({ success: false, error: { code: 'ACCESS_DENIED', message: 'Member account is restricted' } });
    }

    const policy = member.borrowingPolicyId;
    if (policy && policy.digitalAccessAllowed === false) {
      await logAccess(resource._id, member._id, action, 'DENIED', 'Policy forbids digital access', req);
      return res.status(403).json({ success: false, error: { code: 'ACCESS_DENIED', message: 'Your policy does not allow digital access' } });
    }

    // Generate secure URL
    const url = await generatePresignedUrl(resource.bucketName, resource.objectName, 3600);
    
    // Update metrics
    if (action === 'DOWNLOAD') resource.downloadCount += 1;
    if (action === 'VIEW') resource.viewCount += 1;
    await resource.save();

    await logAccess(resource._id, member._id, action, 'SUCCESS', null, req);

    res.json({ success: true, data: { url, expires_in: 3600 } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

async function logAccess(resourceId, memberId, accessType, status, reason, req) {
  try {
    await DigitalAccessLog.create({
      resourceId,
      memberId,
      accessType,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status,
      denialReason: reason
    });
  } catch (err) {
    console.error('Failed to log digital access:', err);
  }
}
