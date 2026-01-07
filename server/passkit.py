#!/usr/bin/env python3
"""
PassKit Python SDK integration for Coffee Lin Loyalty Portal
Handles member management, points operations, and tier updates
"""

import os
import grpc
from passkit_io.grpc import Members
from passkit_io.grpc.Membership import member_events_pb2
from passkit_io.grpc.Membership import member_pb2

# PassKit credentials path
CERTS_PATH = os.path.join(os.path.dirname(__file__), '..', 'certs')
CERT_FILE = os.path.join(CERTS_PATH, 'certificate.pem')
KEY_FILE = os.path.join(CERTS_PATH, 'key.pem')
CA_CHAIN_FILE = os.path.join(CERTS_PATH, 'ca-chain.pem')

def get_passkit_credentials():
    """Load PassKit SSL credentials"""
    try:
        with open(CERT_FILE, 'rb') as f:
            certificate = f.read()
        with open(KEY_FILE, 'rb') as f:
            private_key = f.read()
        with open(CA_CHAIN_FILE, 'rb') as f:
            ca_chain = f.read()
        
        return grpc.ssl_channel_credentials(
            root_certificates=ca_chain,
            private_key=private_key,
            certificate_chain=certificate
        )
    except FileNotFoundError as e:
        raise Exception(f"PassKit credentials not found: {e}")

def get_member_by_phone(phone_number: str, program_id: str):
    """
    Search for a member by phone number
    
    Args:
        phone_number: Customer phone number
        program_id: PassKit program ID
        
    Returns:
        Member object or None if not found
    """
    try:
        credentials = get_passkit_credentials()
        members_client = Members.MembersStub(
            grpc.secure_channel('grpc.pub1.passkit.io:443', credentials)
        )
        
        # Search by external ID (phone number)
        request = member_pb2.GetMemberRecordRequest(
            externalId=phone_number,
            programId=program_id
        )
        
        member = members_client.getMemberRecordByExternalId(request)
        return member
    except grpc.RpcError as e:
        if e.code() == grpc.StatusCode.NOT_FOUND:
            return None
        raise Exception(f"Error fetching member: {e.details()}")

def get_member_by_id(member_id: str):
    """
    Get member by PassKit member ID
    
    Args:
        member_id: PassKit member ID (22 characters)
        
    Returns:
        Member object
    """
    try:
        credentials = get_passkit_credentials()
        members_client = Members.MembersStub(
            grpc.secure_channel('grpc.pub1.passkit.io:443', credentials)
        )
        
        request = member_pb2.GetMemberRecordRequest(id=member_id)
        member = members_client.getMemberRecord(request)
        return member
    except grpc.RpcError as e:
        raise Exception(f"Error fetching member: {e.details()}")

def create_member(program_id: str, tier_id: str, phone_number: str, name: str):
    """
    Create a new member in PassKit
    
    Args:
        program_id: PassKit program ID
        tier_id: PassKit tier ID
        phone_number: Customer phone number
        name: Customer name
        
    Returns:
        Created member object with member ID
    """
    try:
        credentials = get_passkit_credentials()
        members_client = Members.MembersStub(
            grpc.secure_channel('grpc.pub1.passkit.io:443', credentials)
        )
        
        member = member_pb2.Member(
            programId=program_id,
            tierId=tier_id,
            externalId=phone_number,
            person=member_pb2.Person(
                displayName=name,
                mobileNumber=phone_number
            ),
            points=0
        )
        
        created_member = members_client.createMember(member)
        return created_member
    except grpc.RpcError as e:
        raise Exception(f"Error creating member: {e.details()}")

def add_points(member_id: str, program_id: str, points: int, note: str = ""):
    """
    Add points to a member's account
    
    Args:
        member_id: PassKit member ID
        program_id: PassKit program ID
        points: Number of points to add
        note: Optional note for the transaction
        
    Returns:
        Updated member object
    """
    try:
        credentials = get_passkit_credentials()
        members_client = Members.MembersStub(
            grpc.secure_channel('grpc.pub1.passkit.io:443', credentials)
        )
        
        request = member_events_pb2.EarnPointsRequest(
            id=member_id,
            programId=program_id,
            points=points,
            note=note
        )
        
        updated_member = members_client.earnPoints(request)
        return updated_member
    except grpc.RpcError as e:
        raise Exception(f"Error adding points: {e.details()}")

def redeem_points(member_id: str, program_id: str, points: int, note: str = ""):
    """
    Redeem (use) points from a member's account
    
    Args:
        member_id: PassKit member ID
        program_id: PassKit program ID
        points: Number of points to redeem
        note: Optional note for the transaction
        
    Returns:
        Updated member object
    """
    try:
        credentials = get_passkit_credentials()
        members_client = Members.MembersStub(
            grpc.secure_channel('grpc.pub1.passkit.io:443', credentials)
        )
        
        request = member_events_pb2.RedeemPointsRequest(
            id=member_id,
            programId=program_id,
            points=points,
            note=note
        )
        
        updated_member = members_client.redeemPoints(request)
        return updated_member
    except grpc.RpcError as e:
        raise Exception(f"Error redeeming points: {e.details()}")

def update_member_tier(member_id: str, tier_id: str):
    """
    Update a member's tier
    
    Args:
        member_id: PassKit member ID
        tier_id: New tier ID
        
    Returns:
        Updated member object
    """
    try:
        credentials = get_passkit_credentials()
        members_client = Members.MembersStub(
            grpc.secure_channel('grpc.pub1.passkit.io:443', credentials)
        )
        
        # Get current member
        get_request = member_pb2.GetMemberRecordRequest(id=member_id)
        member = members_client.getMemberRecord(get_request)
        
        # Update tier
        member.tierId = tier_id
        updated_member = members_client.updateMember(member)
        
        return updated_member
    except grpc.RpcError as e:
        raise Exception(f"Error updating tier: {e.details()}")

def calculate_tier(points: int) -> str:
    """
    Calculate tier based on points
    
    Args:
        points: Current points balance
        
    Returns:
        Tier name: "Silver", "Gold", or "Platinum"
    """
    if points >= 200:
        return "Platinum"
    elif points >= 100:
        return "Gold"
    else:
        return "Silver"

def calculate_cashback(spent_amount: float) -> int:
    """
    Calculate 5% cashback in bonus points
    1 bonus = 10 qəpik (0.10 AZN)
    
    Args:
        spent_amount: Amount spent in AZN
        
    Returns:
        Number of bonus points
    """
    cashback_azn = spent_amount * 0.05  # 5% cashback
    bonus_points = int(cashback_azn / 0.10)  # 1 bonus = 10 qəpik
    return bonus_points
