import React from 'react';
import { FaTimes } from 'react-icons/fa';

const ServiceDetailsModal = ({ isOpen, onClose, serviceData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2C5AA0] to-[#1e3a8a] px-6 py-4 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Service Details</h2>
              <p className="text-blue-100 text-sm">Professional service information</p>
            </div>
            <button
              onClick={onClose}
              className="text-blue-100 hover:text-white p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        {serviceData ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-[#2C5AA0] mb-2">Partner Type</h3>
                  <p className="text-gray-700 font-medium capitalize">{serviceData.partnerType || 'Not specified'}</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-[#2C5AA0] mb-3">Services Offered</h3>
                  <div className="flex flex-wrap gap-2">
                    {serviceData.services ? serviceData.services.split(',').map((service, index) => (
                      <span key={index} className="bg-[#2C5AA0] text-white px-3 py-1 rounded-full text-sm font-medium">
                        {service.trim()}
                      </span>
                    )) : <span className="text-gray-500">No services specified</span>}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-[#2C5AA0] mb-3">Industries</h3>
                  <div className="flex flex-wrap gap-2">
                    {serviceData.industries ? serviceData.industries.split(',').map((industry, index) => (
                      <span key={index} className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {industry.trim()}
                      </span>
                    )) : <span className="text-gray-500">No industries specified</span>}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-[#2C5AA0] mb-3">Experience Industries</h3>
                  <div className="flex flex-wrap gap-2">
                    {serviceData.experienceIndustries ? serviceData.experienceIndustries.split(',').map((exp, index) => (
                      <span key={index} className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {exp.trim()}
                      </span>
                    )) : <span className="text-gray-500">No experience industries specified</span>}
                  </div>
                </div>

                {serviceData.organisationName && (
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-[#2C5AA0] mb-2">Organisation Name</h3>
                    <p className="text-gray-700 font-medium">{serviceData.organisationName}</p>
                  </div>
                )}

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-[#2C5AA0] mb-2">Experience Years</h3>
                  <p className="text-gray-700 text-xl font-bold">{serviceData.experienceYears || 'Not specified'}</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-[#2C5AA0] mb-3">Professional Bio</h3>
                <p className="text-gray-700 leading-relaxed">{serviceData.bio || 'No bio provided'}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-[#2C5AA0]">📋</span>
            </div>
            <p className="text-gray-500 text-lg">No service details available. Please complete your AI Profile first.</p>
          </div>
        )}

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-[#2C5AA0] hover:bg-[#1e3a8a] text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailsModal;
