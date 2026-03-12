import Department from '../models/Department.js';

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
export const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find().sort({ createdAt: -1 });
        res.json({ data: departments });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single department
// @route   GET /api/departments/:id
// @access  Private
export const getDepartmentById = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);
        if (department) {
            res.json({ data: department });
        } else {
            res.status(404).json({ message: 'Department not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create department
// @route   POST /api/departments
// @access  Private
export const createDepartment = async (req, res) => {
    try {
        const department = await Department.create(req.body);
        res.status(201).json({ data: department });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Department code already exists' });
        }
        res.status(400).json({ message: error.message || 'Invalid department data' });
    }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private
export const updateDepartment = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);

        if (department) {
            const updatedDepartment = await Department.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );
            res.json({ data: updatedDepartment });
        } else {
            res.status(404).json({ message: 'Department not found' });
        }
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Department code already exists' });
        }
        res.status(400).json({ message: error.message || 'Invalid department data' });
    }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private
export const deleteDepartment = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);

        if (department) {
            await department.deleteOne();
            res.json({ data: { message: 'Department removed' } });
        } else {
            res.status(404).json({ message: 'Department not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

