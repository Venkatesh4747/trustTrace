/**Validation patterns , lists */
export const validation = {
    emailPattern: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,10}$/
};

/**Amplitude const tags */
export const amplitude = {
    supplier: {
        title: 'Suppliers',
        suppliersList: 'Suppliers Page Viewed',
        assessmentLaunched: 'Assessment Launched',
        addSupplierClicked: 'Add Supplier clicked',
        addSupplierCanceled: 'Add supplier cancel button clicked',
        addSupplierFormValidationError: 'Add supplier form validation error occurred',
        addSupplierSuccessWithNoConflicts: 'Add supplier success [No conflicts]',
        addSupplierSuccessExactEmailMatch: 'Add supplier success [Exact email match]',
        addSupplierSuccessWithDomainConflicts: 'Add supplier success [Domain conflicts]',
        addSupplierFailed: 'Add supplier failed',
        addSupplierAssociationSucceed: 'Add supplier association success',
        addSupplierAssociationFailed: 'Add supplier association failed',
        supplierInviteRemainderClicked: 'Reminder to Accept button clicked',
        doNotInvite: 'Do not invite clicked',
        doNotInviteCanceled: 'Do not invite canceled',
        editSupplierInviteClicked: 'Edit supplier invite clicked',
        editSupplierInviteSuccess: 'Edit supplier invite success',
        editSupplierInviteConflict: 'Edit supplier invite conflict',
        editSupplierInviteFailed: 'Edit supplier invite failed',
        editSupplierInviteCanceled: 'Edit supplier invite canceled',
        inviteUninvitedSupplierClicked: 'Invite uninvited supplier clicked',
        inviteUninvitedSupplierSuccess: 'Invite uninvited supplier success',
        inviteUninvitedSupplierFailed: 'Invite uninvited supplier failed',
        weeklyNotifyEmailPreferenceClicked: 'Weekly Notify email option preferred by user',
        instantNotifyEmailPreferenceClicked: 'Instant notify email option preferred by user',
        addSupplierConflicts: 'Supplier Conflicts!'
    }
};

/**success ,error messages */
export const messages = {
    supplier: {
        invitedNoConflicts: 'An invitation email has been sent to this supplier and is waiting for acceptance',
        invitedEmailAlreadyExists: 'An invitation email has been sent to this supplier and is waiting for acceptance',
        domainMatch: `A similar company has been found on our platform and is 
                      being reviewed by TrusTrace Admin.This supplier will be available to use on the platform in not more than 24 hours
                    `,
        commonError: {
            addSupplier: `Unable to add supplier. Please try again`,
            updateSupplierInvite: `Unable to update supplier invite. Please try again`
        },
        supplierWithConflicts:
            'There are conflicts with the updated supplier data, please check the supplier conflicts tab for further details.',
        addSupplierSuccess: 'Supplier has been added successfully.'
    }
};

/**popup modal data`s */
export const popup = {
    supplier: {
        doNotInvite: {
            title: 'Not inviting the supplier?',
            message:
                'Are you sure you do not want to invite the supplier to the platform? Such suppliers will not be registered on the platform and cannot be launched any new requests'
        },
        movedToUnInvite: {
            title: 'Moved to uninvited list',
            message: 'has been moved to the uninvited supplier list'
        }
    }
};

/**Excel export entities */
export enum DataExportEntity {
    STYLE = 'STYLE',
    ML = 'ML',
    SUPPLIER = 'SUPPLIER',
    FACILITY = 'FACILITY',
    SUB_SUPPLIER = 'SUB_SUPPLIER',
    AUDIT = 'AUDIT',
    SUPPLIER_LINKING = 'SUPPLIER_LINKING'
}

export enum IndexTypeMapper {
    STYLE = 'style',
    MATERIAL_LIBRARY = 'material_library',
    SUPPLIER_PROFILE = 'supplier_profile',
    SUB_SUPPLIER_PROFILE = 'sub_supplier_profile',
    FACILITY_PROFILE = 'facility_profile',
    FACILITY_AUDIT = 'facility_audit'
}

export const ImportStatuses = {
    CLOSE: 'Close',
    IMPORT_COMPLETED: 'Import Completed',
    WARNING: 'WARNING'
};
