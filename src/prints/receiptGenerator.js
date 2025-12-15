// utils/receiptGenerator.js

import pdfMake from 'pdfmake/build/pdfmake';
import {
    getReportHeader, getReportFooter, getSignatureSection,
    commonPdfStyles, formatDate, loadPdfFonts
} from './HeaderAndFooterComponent';

/**
 * Generate Fee Receipt PDF
 * Supports individual installment receipts and full payment receipts
 */
export const generateFeeReceipt = async (paymentData, student, schoolData, studentFee, generatedBy = 'System') => {
    await loadPdfFonts();

    const isInstallment = !!paymentData.installment_id;
    const receiptTitle = isInstallment ? 'Fee Payment Receipt (Installment)' : 'Fee Payment Receipt (Full Payment)';

    const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60],
        header: function (currentPage, pageCount, pageSize) {
            return getReportHeader(schoolData, receiptTitle, `Receipt: ${paymentData.receipt_number}`, 'portrait');
        },
        footer: function (currentPage, pageCount) {
            return getReportFooter(currentPage, pageCount, generatedBy);
        },
        content: [
            // Receipt Info Section
            {
                columns: [
                    {
                        stack: [
                            { text: 'Receipt Details', style: 'sectionTitle' },
                            {
                                columns: [
                                    { text: 'Receipt No.:', bold: true, width: 120 },
                                    { text: paymentData.receipt_number }
                                ],
                                margin: [0, 5, 0, 5]
                            },
                            {
                                columns: [
                                    { text: 'Date:', bold: true, width: 120 },
                                    { text: formatDate(paymentData.payment_date) }
                                ],
                                margin: [0, 5, 0, 5]
                            },
                            {
                                columns: [
                                    { text: 'Payment Mode:', bold: true, width: 120 },
                                    { text: paymentData.payment_mode }
                                ],
                                margin: [0, 5, 0, 0]
                            }
                        ],
                        width: '48%'
                    },
                    {
                        stack: [
                            { text: 'Student Information', style: 'sectionTitle' },
                            {
                                columns: [
                                    { text: 'Name:', bold: true, width: 120 },
                                    { text: student?.name || 'N/A' }
                                ],
                                margin: [0, 5, 0, 5]
                            },
                            {
                                columns: [
                                    { text: 'Roll No.:', bold: true, width: 120 },
                                    { text: student?.roll_no || 'N/A' }
                                ],
                                margin: [0, 5, 0, 5]
                            },
                            {
                                columns: [
                                    { text: 'Class:', bold: true, width: 120 },
                                    { text: student?.class || 'N/A' }
                                ],
                                margin: [0, 5, 0, 0]
                            }
                        ],
                        width: '48%'
                    }
                ],
                columnGap: 20,
                margin: [0, 0, 0, 20]
            },

            // Horizontal Line
            {
                canvas: [
                    {
                        type: 'line',
                        x1: 0,
                        y1: 5,
                        x2: 515,
                        y2: 5,
                        lineWidth: 1,
                        lineColor: '#cccccc'
                    }
                ],
                margin: [0, 0, 0, 15]
            },

            // Fee Details Section
            {
                text: 'Fee Payment Details',
                style: 'sectionTitle'
            },
            {
                layout: 'lightHorizontalLines',
                table: {
                    headerRows: 1,
                    widths: ['*', 120, 140],
                    body: [
                        [
                            { text: 'Description', style: 'tableHeader' },
                            { text: 'Amount (₹)', style: 'tableHeader', alignment: 'right' },
                            { text: 'Remarks', style: 'tableHeader' }
                        ],
                        [
                            {
                                stack: [
                                    { text: paymentData.installment_name || 'N/A', bold: true },
                                    {
                                        text: isInstallment
                                            ? `Installment: ${paymentData.installment_name || 'N/A'}`
                                            : 'Full Payment',
                                        fontSize: 9,
                                        color: '#666666'
                                    }
                                ]
                            },
                            { text: paymentData.amount_paid.toLocaleString(), alignment: 'right' },
                            { text: paymentData.remarks || '-', fontSize: 9 }
                        ]
                    ]
                },
                margin: [0, 0, 0, 20]
            },

            // Transaction Details
            {
                text: 'Transaction Information',
                style: 'sectionTitle'
            },
            {
                columns: [
                    {
                        width: '48%',
                        stack: [
                            {
                                columns: [
                                    { text: 'Payment Mode:', bold: true, width: 130 },
                                    { text: paymentData.payment_mode }
                                ],
                                margin: [0, 5, 0, 5]
                            },
                            paymentData.payment_mode === 'ONLINE' || paymentData.payment_mode === 'UPI' || paymentData.payment_mode === 'CARD'
                                ? {
                                    columns: [
                                        { text: 'Transaction ID:', bold: true, width: 130 },
                                        { text: paymentData.transaction_id || 'N/A', fontSize: 9, color: '#667eea' }
                                    ],
                                    margin: [0, 5, 0, 0]
                                }
                                : { text: '' },
                            paymentData.payment_mode === 'CHEQUE'
                                ? [
                                    {
                                        columns: [
                                            { text: 'Cheque No.:', bold: true, width: 130 },
                                            { text: paymentData.cheque_number || 'N/A' }
                                        ],
                                        margin: [0, 5, 0, 5]
                                    },
                                    {
                                        columns: [
                                            { text: 'Bank Name:', bold: true, width: 130 },
                                            { text: paymentData.bank_name || 'N/A' }
                                        ],
                                        margin: [0, 0, 0, 0]
                                    }
                                ]
                                : { text: '' }
                        ]
                    },
                    {
                        width: '48%',
                        stack: [
                            {
                                columns: [
                                    { text: 'Collected By:', bold: true, width: 120 },
                                    { text: paymentData.collected_by || 'N/A' }
                                ],
                                margin: [0, 5, 0, 5]
                            },
                            {
                                columns: [
                                    { text: 'Payment Date:', bold: true, width: 120 },
                                    { text: formatDate(paymentData.payment_date) }
                                ],
                                margin: [0, 0, 0, 0]
                            }
                        ]
                    }
                ],
                columnGap: 20,
                margin: [0, 0, 0, 20]
            },

            // Amount Summary Box
            {
                stack: [
                    {
                        columns: [
                            { text: 'Amount Paid:', bold: true, width: '*' },
                            { text: `₹ ${paymentData.amount_paid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, bold: true, fontSize: 14, color: '#667eea' }
                        ],
                        margin: [0, 10, 0, 10]
                    }
                ],
                border: [true, true, true, true],
                borderColor: '#667eea',
                borderWidth: 2,
                margin: [0, 0, 0, 20],
                fillColor: '#f8f9ff',
                padding: [15, 15, 15, 15]
            },

            // Fee Summary (if available)
            studentFee && {
                stack: [
                    { text: 'Fee Summary', style: 'sectionTitle' },
                    {
                        columns: [
                            {
                                width: 'auto',
                                stack: [
                                    {
                                        columns: [
                                            { text: 'Total Fee Amount:', bold: true, width: 150 },
                                            { text: `₹ ${studentFee.total_amount?.toLocaleString()}` }
                                        ],
                                        margin: [0, 5, 0, 5]
                                    },
                                    {
                                        columns: [
                                            { text: 'Previously Paid:', bold: true, width: 150 },
                                            { text: `₹ ${(studentFee.paid_amount - paymentData.amount_paid)?.toLocaleString()}` }
                                        ],
                                        margin: [0, 5, 0, 5]
                                    },
                                    {
                                        columns: [
                                            { text: 'Paid Today:', bold: true, width: 150 },
                                            { text: `₹ ${paymentData.amount_paid.toLocaleString()}`, color: '#27ae60' }
                                        ],
                                        margin: [0, 5, 0, 5]
                                    },
                                    {
                                        columns: [
                                            { text: 'Discount:', bold: true, width: 150 },
                                            { text: `₹ ${studentFee.discount_amount?.toLocaleString()}` }
                                        ],
                                        margin: [0, 5, 0, 5]
                                    },
                                    {
                                        columns: [
                                            { text: 'Remaining Balance:', bold: true, width: 150 },
                                            { text: `₹ ${(studentFee.total_amount - studentFee.paid_amount - paymentData.amount_paid)?.toLocaleString()}`, color: '#e74c3c' }
                                        ],
                                        margin: [0, 5, 0, 0]
                                    }
                                ]
                            }
                        ]
                    }
                ],
                margin: [0, 0, 0, 20]
            },

            // Terms & Conditions
            {
                stack: [
                    { text: 'Terms & Conditions', style: 'sectionTitle', fontSize: 10 },
                    {
                        ul: [
                            'This is a digital receipt generated by the school management system.',
                            'Please keep this receipt for your records.',
                            'In case of any discrepancy, please contact the school office.',
                            'Refund policy as per school norms.',
                            'This receipt is valid only when duly signed.'
                        ],
                        fontSize: 8,
                        color: '#666666'
                    }
                ],
                margin: [0, 0, 0, 30]
            },

            // Signature Section
            getSignatureSection([
                { label: 'Accountant Signature', position: 'left' },
                { label: 'Principal Signature', position: 'right' }
            ])
        ],
        styles: {
            ...commonPdfStyles,
            tableHeader: {
                fontSize: 10,
                bold: true,
                alignment: 'center',
                color: '#ffffff',
                fillColor: '#667eea'
            }
        },
        defaultStyle: {
            font: 'Roboto',
            fontSize: 10
        }
    };

    return docDefinition;
};

/**
 * Generate Installment Payment Summary
 * Shows all installments for a fee with payment status
 */
export const generateInstallmentSummary = async (studentFee, installments, student, schoolData, generatedBy = 'System') => {
    await loadPdfFonts();

    const totalPaid = installments.reduce((sum, inst) => sum + parseFloat(inst.paid_amount || 0), 0);
    const totalBalance = installments.reduce((sum, inst) => sum + parseFloat(inst.balance_amount || 0), 0);

    const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60],
        header: function (currentPage, pageCount, pageSize) {
            return getReportHeader(schoolData, 'Installment Payment Summary', `Fee: ${studentFee.fee_structure?.fee_name}`, 'portrait');
        },
        footer: function (currentPage, pageCount) {
            return getReportFooter(currentPage, pageCount, generatedBy);
        },
        content: [
            // Student Info
            {
                columns: [
                    {
                        stack: [
                            { text: 'Student Details', style: 'sectionTitle' },
                            {
                                columns: [
                                    { text: 'Name:', bold: true, width: 100 },
                                    { text: student?.name || 'N/A' }
                                ],
                                margin: [0, 5, 0, 5]
                            },
                            {
                                columns: [
                                    { text: 'Roll No.:', bold: true, width: 100 },
                                    { text: student?.roll_no || 'N/A' }
                                ],
                                margin: [0, 5, 0, 5]
                            },
                            {
                                columns: [
                                    { text: 'Class:', bold: true, width: 100 },
                                    { text: student?.class || 'N/A' }
                                ],
                                margin: [0, 0, 0, 0]
                            }
                        ],
                        width: '48%'
                    },
                    {
                        stack: [
                            { text: 'Fee Details', style: 'sectionTitle' },
                            {
                                columns: [
                                    { text: 'Fee Name:', bold: true, width: 100 },
                                    { text: studentFee.fee_structure?.fee_name || 'N/A' }
                                ],
                                margin: [0, 5, 0, 5]
                            },
                            {
                                columns: [
                                    { text: 'Total Amount:', bold: true, width: 100 },
                                    { text: `₹ ${studentFee.total_amount?.toLocaleString()}` }
                                ],
                                margin: [0, 5, 0, 5]
                            },
                            {
                                columns: [
                                    { text: 'Recurring:', bold: true, width: 100 },
                                    { text: studentFee?.fee_structure?.is_recurring ? `${studentFee?.fee_structure?.recurrence_type} (${studentFee?.fee_structure?.recurrence_months} periods)` : 'No' }
                                ],
                                margin: [0, 0, 0, 0]
                            }
                        ],
                        width: '48%'
                    }
                ],
                columnGap: 20,
                margin: [0, 0, 0, 20]
            },

            // Divider
            {
                canvas: [
                    {
                        type: 'line',
                        x1: 0,
                        y1: 5,
                        x2: 515,
                        y2: 5,
                        lineWidth: 1,
                        lineColor: '#cccccc'
                    }
                ],
                margin: [0, 0, 0, 15]
            },

            // Installments Table
            {
                text: 'Installment Breakdown',
                style: 'sectionTitle'
            },
            {
                layout: 'lightHorizontalLines',
                table: {
                    headerRows: 1,
                    widths: [40, '*', '*', '*', '*', '*'],
                    body: [
                        [
                            { text: '#', style: 'tableHeader', alignment: 'center' },
                            { text: 'Installment', style: 'tableHeader' },
                            { text: 'Amount (₹)', style: 'tableHeader', alignment: 'right' },
                            { text: 'Paid (₹)', style: 'tableHeader', alignment: 'right' },
                            { text: 'Balance (₹)', style: 'tableHeader', alignment: 'right' },
                            { text: 'Status', style: 'tableHeader', alignment: 'center' }
                        ],
                        ...installments.map((inst, index) => [
                            { text: index + 1, alignment: 'center' },
                            { text: inst.installment_name },
                            { text: inst.amount.toLocaleString(), alignment: 'right' },
                            { text: inst.paid_amount.toLocaleString(), alignment: 'right', color: inst.paid_amount > 0 ? '#27ae60' : '#000' },
                            { text: inst.balance_amount.toLocaleString(), alignment: 'right', color: inst.balance_amount > 0 ? '#e74c3c' : '#27ae60' },
                            {
                                text: inst.status,
                                alignment: 'center',
                                color: inst.status === 'PAID' ? '#27ae60' : inst.status === 'PARTIAL' ? '#f39c12' : inst.status === 'CANCELLED' ? '#999' : '#e74c3c',
                                bold: true
                            }
                        ])
                    ]
                },
                margin: [0, 0, 0, 20]
            },

            // Summary Box
            {
                stack: [
                    {
                        columns: [
                            { text: 'Total Amount:', bold: true, width: '*' },
                            { text: `₹ ${studentFee.total_amount?.toLocaleString()}`, bold: true }
                        ],
                        margin: [0, 8, 0, 8]
                    },
                    {
                        columns: [
                            { text: 'Total Paid:', bold: true, width: '*' },
                            { text: `₹ ${totalPaid.toLocaleString()}`, bold: true, color: '#27ae60' }
                        ],
                        margin: [0, 8, 0, 8]
                    },
                    {
                        columns: [
                            { text: 'Balance Due:', bold: true, width: '*' },
                            { text: `₹ ${totalBalance.toLocaleString()}`, bold: true, color: totalBalance > 0 ? '#e74c3c' : '#27ae60' }
                        ],
                        margin: [0, 8, 0, 0]
                    }
                ],
                border: [true, true, true, true],
                borderColor: '#667eea',
                borderWidth: 2,
                fillColor: '#f8f9ff',
                padding: [15, 15, 15, 15],
                margin: [0, 0, 0, 30]
            },

            // Signature
            getSignatureSection([
                { label: 'Accountant Signature', position: 'left' },
                { label: 'Principal Signature', position: 'right' }
            ])
        ],
        styles: {
            ...commonPdfStyles
        },
        defaultStyle: {
            font: 'Roboto',
            fontSize: 10
        }
    };

    return docDefinition;
};

/**
 * Download or Print PDF
 */
export const downloadPDF = async (docDefinition, fileName = 'receipt.pdf') => {
    try {
        const pdfDoc = pdfMake.createPdf(docDefinition);
        pdfDoc.download(fileName);
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
};

export const printPDF = async (docDefinition) => {
    try {
        const pdfDoc = pdfMake.createPdf(docDefinition);
        pdfDoc.print();
    } catch (error) {
        console.error('Error printing PDF:', error);
        throw error;
    }
};

export const openPDFInWindow = async (docDefinition) => {
    try {
        const pdfDoc = pdfMake.createPdf(docDefinition);
        pdfDoc.open();
    } catch (error) {
        console.error('Error opening PDF:', error);
        throw error;
    }
};
