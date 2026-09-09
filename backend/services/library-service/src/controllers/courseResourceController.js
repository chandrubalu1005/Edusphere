const CourseResource = require('../models/CourseResource');
const DocumentVersion = require('../models/DocumentVersion');
const AuditRecord = require('../models/AuditRecord');
const { generatePresignedUrl } = require('../config/minio');
const crypto = require('crypto');

exports.uploadCourseResource = async (req, res) => {
  try {
    const { 
      courseOfferingId, departmentId, unitNumber, title, description, 
      resourceType, visibility, programId, batchId, academicYearId, 
      yearOfStudy, semesterId, masterCourseId 
    } = req.body;
    
    // Validate unitNumber exactly 1 to 5
    if (![1, 2, 3, 4, 5].includes(Number(unitNumber))) {
      return res.status(400).json({ success: false, error: { message: 'Unit number must be exactly 1, 2, 3, 4, or 5' } });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }

    // Role verification (Only Faculty/Admin)
    if (req.user.role === 'student') {
      return res.status(403).json({ success: false, error: { message: 'Students cannot upload course resources' } });
    }

    // Find if it already exists
    let resource = await CourseResource.findOne({ courseOfferingId, unitNumber, title });

    if (!resource) {
      resource = new CourseResource({
        courseOfferingId, masterCourseId, departmentId, programId, batchId,
        academicYearId, yearOfStudy, semesterId, unitNumber: Number(unitNumber),
        title, description, resourceType, visibility, ownerId: req.user.id,
        isDocumentBacked: !!req.file
      });
      await resource.save();
    }

    let version = null;
    if (req.file) {
      // Create DocumentVersion
      const versionCount = await DocumentVersion.countDocuments({ courseResourceId: resource._id });
      const checksum = crypto.createHash('md5').update(req.file.buffer).digest('hex');
      
      // In a real system, we'd upload to MinIO here. We mock the key for now.
      const objectKey = `courses/${courseOfferingId}/unit${unitNumber}/${Date.now()}_${req.file.originalname}`;
      
      version = new DocumentVersion({
        courseResourceId: resource._id,
        versionNumber: versionCount + 1,
        uploadedBy: req.user.id,
        checksum,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        objectKey
      });
      
      await version.save();
      resource.activeVersionId = version._id;
      await resource.save();
    }

    // Audit Logging
    await AuditRecord.create({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: version && version.versionNumber > 1 ? 'COURSE_RESOURCE_UPDATED' : 'COURSE_RESOURCE_UPLOADED',
      resourceId: resource._id.toString(),
      resourceModel: 'CourseResource',
      scope: { departmentId, courseOfferingId },
      changeSummary: `Uploaded ${title} (Unit ${unitNumber})`,
      status: 'SUCCESS'
    });

    res.json({ success: true, data: { resource, version } });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, error: { message: 'A resource with this title already exists in this unit' } });
    }
    console.error(error);
    res.status(500).json({ success: false, error: { message: 'Server Error' } });
  }
};

exports.getCourseResources = async (req, res) => {
  try {
    const { courseOfferingId, departmentId, unitNumber } = req.query;
    const filter = { status: 'ACTIVE' };
    
    if (courseOfferingId) filter.courseOfferingId = courseOfferingId;
    if (departmentId) filter.departmentId = departmentId;
    if (unitNumber) filter.unitNumber = Number(unitNumber);

    // HOD authorization logic
    if (req.user.role === 'hod' && filter.departmentId !== req.user.departmentId) {
      // HOD can only access their own department
      await AuditRecord.create({
        actorId: req.user.id, actorRole: req.user.role,
        action: 'COURSE_RESOURCE_VIEW', resourceId: filter.departmentId || 'unknown',
        resourceModel: 'Department', scope: { requestedDepartmentId: filter.departmentId },
        status: 'DENIED', reason: 'HOD attempted to access another department'
      });
      return res.status(403).json({ success: false, error: { message: 'Access Denied: Department Scope Violation' } });
    }

    const resources = await CourseResource.find(filter).populate('activeVersionId');
    res.json({ success: true, data: resources });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Server Error' } });
  }
};
