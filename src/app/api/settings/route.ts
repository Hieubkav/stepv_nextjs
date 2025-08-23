import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { UpdateSettingsRequest } from '@/types/settings';

// GET /api/settings - Lấy settings (record duy nhất)
export async function GET() {
  try {
    // Kiểm tra authentication (tạm thời bỏ qua để test)
    // const { data: { user }, error: authError } = await supabase.auth.getUser();
    // if (authError || !user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { data: settings, error } = await supabase
      .from('settings')
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Nếu chưa có record nào, tạo record mặc định
        const { data: newSettings, error: createError } = await supabase
          .from('settings')
          .insert([{
            site_name: 'Step V Studio',
            site_description: 'Chuyên gia hình ảnh 3D cho thương hiệu nước hoa & làm đẹp'
          }])
          .select()
          .single();

        if (createError) {
          console.error('Error creating default settings:', createError);
          return NextResponse.json({ error: 'Failed to create default settings' }, { status: 500 });
        }

        return NextResponse.json(newSettings);
      }

      console.error('Error fetching settings:', error);
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error in GET /api/settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/settings - Cập nhật settings
export async function PUT(request: NextRequest) {
  try {
    // Kiểm tra authentication (tạm thời bỏ qua để test)
    // const { data: { user }, error: authError } = await supabase.auth.getUser();
    // if (authError || !user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body: UpdateSettingsRequest = await request.json();

    // Lấy record hiện tại
    const { data: currentSettings, error: fetchError } = await supabase
      .from('settings')
      .select('*')
      .single();

    if (fetchError) {
      console.error('Error fetching current settings:', fetchError);
      return NextResponse.json({ error: 'Settings not found' }, { status: 404 });
    }

    // Cập nhật settings
    const { data: updatedSettings, error: updateError } = await supabase
      .from('settings')
      .update(body)
      .eq('id', currentSettings.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating settings:', updateError);
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Error in PUT /api/settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
