// src/utils/progressCardPdfGenerator.js

import pdfMake from 'pdfmake/build/pdfmake';
import {
    getReportHeader,
    getReportFooter,
    getSignatureSection,
    commonPdfStyles,
    loadPdfFonts
} from './HeaderAndFooterComponent';

export const generateProgressCardPdf = async (progressCardData, schoolData = null, action) => {
    await loadPdfFonts();

    const {
        student_name,
        roll_number,
        class_name,
        section_name,
        exam_name,
        exam_code,
        subject_details,
        overall_total_marks,
        overall_max_marks,
        overall_percentage,
        overall_grade,
        rank,
        total_students,
        class_teacher_name,
        class_teacher_remarks,
        attendance
    } = progressCardData;

    // Title and subtitle
    const title = 'STUDENT PROGRESS REPORT CARD';
    const subtitle = `Academic Year: 2025-26 | ${exam_name} (${exam_code})`;

    // Student Information Section
    const studentInfoSection = {
        style: 'section',
        table: {
            widths: ['25%', '25%', '25%', '25%'],
            body: [
                [
                    { text: 'Student Information', style: 'sectionTitle', colSpan: 4, alignment: 'left', fillColor: '#667eea', color: '#ffffff' },
                    {},
                    {},
                    {}
                ],
                [
                    { text: 'Student Name', bold: true, fillColor: '#f5f5f5' },
                    { text: student_name, colSpan: 3 },
                    {},
                    {}
                ],
                [
                    { text: 'Roll Number', bold: true, fillColor: '#f5f5f5' },
                    { text: roll_number },
                    { text: 'Class & Section', bold: true, fillColor: '#f5f5f5' },
                    { text: `${class_name} - ${section_name}` }
                ],
                [
                    { text: 'Examination', bold: true, fillColor: '#f5f5f5' },
                    { text: exam_name, colSpan: 3 },
                    {},
                    {}
                ]
            ]
        },
        layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#e0e0e0',
            vLineColor: () => '#e0e0e0'
        },
        margin: [0, 0, 0, 15]
    };

    // Subject-wise Marks Table Header
    const marksTableHeader = [
        { text: '#', style: 'tableHeader', alignment: 'center', fillColor: '#667eea', color: '#ffffff', bold: true },
        { text: 'Subject', style: 'tableHeader', fillColor: '#667eea', color: '#ffffff', bold: true },
    ];

    // Check if any subject has internal/external split
    const hasInternalExternal = subject_details.some(s => s.has_internal_external);

    if (hasInternalExternal) {
        marksTableHeader.push(
            { text: 'Internal', style: 'tableHeader', alignment: 'center', fillColor: '#667eea', color: '#ffffff', bold: true },
            { text: 'External', style: 'tableHeader', alignment: 'center', fillColor: '#667eea', color: '#ffffff', bold: true }
        );
    }

    marksTableHeader.push(
        { text: 'Total', style: 'tableHeader', alignment: 'center', fillColor: '#667eea', color: '#ffffff', bold: true },
        { text: 'Max Marks', style: 'tableHeader', alignment: 'center', fillColor: '#667eea', color: '#ffffff', bold: true },
        { text: 'Grade', style: 'tableHeader', alignment: 'center', fillColor: '#667eea', color: '#ffffff', bold: true },
        { text: 'Remarks', style: 'tableHeader', fillColor: '#667eea', color: '#ffffff', bold: true }
    );

    // Subject-wise Marks Table Body
    const marksTableBody = [marksTableHeader];

    subject_details.forEach((subject, index) => {
        const row = [
            { text: index + 1, alignment: 'center', fontSize: 9 },
            {
                stack: [
                    { text: subject.subject_name, fontSize: 10, bold: true },
                    { text: `(${subject.subject_code})`, fontSize: 8, color: '#666666', margin: [0, 2, 0, 0] }
                ]
            }
        ];

        if (hasInternalExternal) {
            if (subject.has_internal_external) {
                row.push(
                    { text: subject.is_absent ? '-' : subject.internal_marks, alignment: 'center', fontSize: 10 },
                    { text: subject.is_absent ? '-' : subject.external_marks, alignment: 'center', fontSize: 10 }
                );
            } else {
                row.push(
                    { text: '-', alignment: 'center', color: '#cccccc', fontSize: 10 },
                    { text: '-', alignment: 'center', color: '#cccccc', fontSize: 10 }
                );
            }
        }

        row.push(
            {
                text: subject.is_absent ? 'AB' : subject.total_marks,
                alignment: 'center',
                fontSize: 10,
                bold: true,
                color: subject.is_absent ? '#f44336' : '#333333'
            },
            { text: subject.max_marks, alignment: 'center', fontSize: 10 },
            {
                text: subject.is_absent ? '-' : subject.grade,
                alignment: 'center',
                fontSize: 10,
                bold: true,
                color: subject.grade === 'A+' || subject.grade === 'A' ? '#4caf50' :
                    subject.grade === 'F' ? '#f44336' : '#ff9800'
            },
            { text: subject.remarks || '-', fontSize: 8, color: '#666666' }
        );

        marksTableBody.push(row);
    });

    // Total Row
    const totalRow = [
        { text: '', border: [false, false, false, false] },
        { text: 'GRAND TOTAL', bold: true, fontSize: 11, fillColor: '#f5f5f5' }
    ];

    if (hasInternalExternal) {
        totalRow.push({ text: '', fillColor: '#f5f5f5' }, { text: '', fillColor: '#f5f5f5' });
    }

    totalRow.push(
        { text: overall_total_marks, alignment: 'center', fontSize: 11, bold: true, fillColor: '#f5f5f5' },
        { text: overall_max_marks, alignment: 'center', fontSize: 11, bold: true, fillColor: '#f5f5f5' },
        { text: overall_grade, alignment: 'center', fontSize: 11, bold: true, fillColor: '#f5f5f5', color: '#667eea' },
        { text: '', fillColor: '#f5f5f5' }
    );

    marksTableBody.push(totalRow);

    // Marks Table
    const marksTable = {
        style: 'section',
        table: {
            headerRows: 1,
            widths: hasInternalExternal
                ? [20, '*', 45, 45, 45, 50, 40, 80]
                : [20, '*', 45, 50, 40, 80],
            body: marksTableBody
        },
        layout: {
            hLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.body.length) ? 1 : 0.5,
            vLineWidth: () => 0.5,
            hLineColor: (i) => (i === 0 || i === 1) ? '#667eea' : '#e0e0e0',
            vLineColor: () => '#e0e0e0'
        },
        margin: [0, 0, 0, 15]
    };

    // Performance Summary
    const performanceSummary = {
        style: 'section',
        table: {
            widths: ['*', '*', '*'],
            body: [
                [
                    {
                        stack: [
                            { text: 'Overall Percentage', fontSize: 9, color: '#666666', alignment: 'center' },
                            { text: `${overall_percentage.toFixed(2)}%`, fontSize: 16, bold: true, color: '#1976d2', alignment: 'center', margin: [0, 5, 0, 0] }
                        ],
                        fillColor: '#e3f2fd',
                        margin: [10, 10, 10, 10]
                    },
                    {
                        stack: [
                            { text: 'Overall Grade', fontSize: 9, color: '#666666', alignment: 'center' },
                            { text: overall_grade, fontSize: 16, bold: true, color: '#4caf50', alignment: 'center', margin: [0, 5, 0, 0] }
                        ],
                        fillColor: '#e8f5e9',
                        margin: [10, 10, 10, 10]
                    },
                    {
                        stack: [
                            { text: 'Class Rank', fontSize: 9, color: '#666666', alignment: 'center' },
                            { text: `${rank} / ${total_students}`, fontSize: 16, bold: true, color: '#ff9800', alignment: 'center', margin: [0, 5, 0, 0] }
                        ],
                        fillColor: '#fff3e0',
                        margin: [10, 10, 10, 10]
                    }
                ]
            ]
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 15]
    };

    // Attendance Section
    const attendanceSection = attendance ? {
        style: 'section',
        table: {
            widths: ['*'],
            body: [
                [
                    {
                        stack: [
                            { text: 'Attendance', bold: true, fontSize: 10, margin: [0, 0, 0, 5] },
                            {
                                text: `Days Present: ${attendance.present_days} / ${attendance.total_days} (${attendance.percentage.toFixed(1)}%)`,
                                fontSize: 9
                            }
                        ],
                        fillColor: '#f5f5f5',
                        margin: [10, 10, 10, 10]
                    }
                ]
            ]
        },
        layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#e0e0e0',
            vLineColor: () => '#e0e0e0'
        },
        margin: [0, 0, 0, 10]
    } : {};

    // Remarks Section
    const remarksSection = {
        style: 'section',
        table: {
            widths: ['*'],
            body: [
                [
                    {
                        stack: [
                            { text: "Class Teacher's Remarks", bold: true, fontSize: 10, margin: [0, 0, 0, 5] },
                            { text: class_teacher_remarks || 'No remarks provided.', fontSize: 9 }
                        ],
                        fillColor: '#e3f2fd',
                        margin: [10, 10, 10, 10]
                    }
                ]
            ]
        },
        layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#e0e0e0',
            vLineColor: () => '#e0e0e0'
        },
        margin: [0, 0, 0, 15]
    };

    // Grading Scale
    const gradingScale = {
        text: [
            { text: 'Grading Scale: ', bold: true, fontSize: 8 },
            { text: 'A+ (90-100) | A (80-89) | B+ (70-79) | B (60-69) | C (50-59) | D (35-49) | F (Below 35)', fontSize: 7, color: '#666666' }
        ],
        margin: [0, 0, 0, 10]
    };

    // Note
    const noteSection = {
        text: [
            { text: 'Note: ', bold: true, fontSize: 8 },
            { text: 'This is a computer-generated document. No signature is required.', fontSize: 7, italics: true, color: '#666666' }
        ],
        margin: [0, 5, 0, 0]
    };

    // Build complete content
    const content = [
        studentInfoSection,
        marksTable,
        performanceSummary,
        ...(attendance ? [attendanceSection] : []),
        remarksSection,
        gradingScale,
        noteSection,
        getSignatureSection([
            { label: `Class Teacher\n${class_teacher_name}`, position: 'left' },
            { label: 'Parent/Guardian', position: 'center' },
            { label: 'Principal', position: 'right' }
        ])
    ];

    // Document definition
    const docDefinition = {
        pageSize: 'A4',
        pageOrientation: 'portrait',
        pageMargins: [30, 140, 30, 50],
        header: (currentPage, pageCount) => {
            if (currentPage === 1) {
                return getReportHeader(schoolData, title, subtitle, 'portrait');
            }
            return {
                stack: [
                    {
                        text: title,
                        alignment: 'center',
                        fontSize: 11,
                        bold: true,
                        color: '#667eea',
                        margin: [0, 15, 0, 2]
                    },
                    {
                        text: subtitle,
                        alignment: 'center',
                        fontSize: 9,
                        color: '#666666',
                        margin: [0, 0, 0, 10]
                    }
                ]
            };
        },
        footer: (currentPage, pageCount) => {
            return getReportFooter(currentPage, pageCount, schoolData?.generatedBy);
        },
        content: content,
        styles: {
            ...commonPdfStyles,
            sectionTitle: {
                fontSize: 11,
                bold: true,
                margin: [0, 5, 0, 5]
            }
        },
        defaultStyle: {
            fontSize: 9,
            color: '#333333'
        }
    };

    // Generate PDF based on action
    if (action === 'print') {
        pdfMake.createPdf(docDefinition).print();
    } else if (action === 'download') {
        const filename = `Progress_Card_${student_name.replace(/\s+/g, '_')}_${exam_code}.pdf`;
        pdfMake.createPdf(docDefinition).download(filename);
    } else {
        pdfMake.createPdf(docDefinition).open();
    }
};
