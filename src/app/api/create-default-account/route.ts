import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, doc, setDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Creating default admin account...');
    
    const adminData = {
      email: 'db@y99.vn',
      username: 'db',
      name: 'DB Admin',
      password: 'Dby996868@',
      role: 'admin',
      isActive: true,
      departmentId: 'admin',
      position: 'System Administrator',
      phone: '',
      address: '',
      avatar: '/avatars/default.jpg',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Check if admin already exists by email
    const emailQuery = query(collection(db, 'employees'), where('email', '==', 'db@y99.vn'));
    const emailSnapshot = await getDocs(emailQuery);
    
    let result = {};
    
    if (!emailSnapshot.empty) {
      // Update existing admin
      const userDoc = emailSnapshot.docs[0];
      await setDoc(doc(db, 'employees', userDoc.id), {
        ...adminData,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      
      result = {
        success: true,
        action: 'updated',
        documentId: userDoc.id,
        message: 'Admin account updated successfully'
      };
      
      console.log('✅ Admin account updated successfully');
    } else {
      // Check if admin exists by username
      const usernameQuery = query(collection(db, 'employees'), where('username', '==', 'db'));
      const usernameSnapshot = await getDocs(usernameQuery);
      
      if (!usernameSnapshot.empty) {
        // Update existing admin by username
        const userDoc = usernameSnapshot.docs[0];
        await setDoc(doc(db, 'employees', userDoc.id), {
          ...adminData,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
        
        result = {
          success: true,
          action: 'updated',
          documentId: userDoc.id,
          message: 'Admin account updated successfully (by username)'
        };
        
        console.log('✅ Admin account updated successfully (by username)');
      } else {
        // Create new admin
        const docRef = await addDoc(collection(db, 'employees'), adminData);
        
        result = {
          success: true,
          action: 'created',
          documentId: docRef.id,
          message: 'Admin account created successfully'
        };
        
        console.log('✅ Admin account created successfully');
      }
    }
    
    console.log('📋 Default Admin Account:');
    console.log('   Email: db@y99.vn');
    console.log('   Username: db');
    console.log('   Password: Dby996868@');
    console.log('   Role: admin');
    
    return NextResponse.json({
      ...result,
      credentials: {
        email: 'db@y99.vn',
        username: 'db',
        password: 'Dby996868@',
        role: 'admin'
      }
    });
    
  } catch (error) {
    console.error('❌ Error creating admin account:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create admin account' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to create default admin account',
    credentials: {
      email: 'db@y99.vn',
      username: 'db',
      password: 'Dby996868@',
      role: 'admin'
    }
  });
}
