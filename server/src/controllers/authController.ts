import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { query } from '../config/database';
import { generateToken } from '../middleware/auth';

/**
 * Register new user
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, display_name, family_group_code } = req.body;

  try {
    // Check if email already exists (if provided)
    if (email) {
      const existingUser = await query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        res.status(400).json({ error: 'Email already registered' });
        return;
      }
    }

    // Handle family group
    let familyGroupId = null;
    if (family_group_code) {
      const familyGroup = await query(
        'SELECT id FROM family_groups WHERE invite_code = $1',
        [family_group_code]
      );

      if (familyGroup.rows.length === 0) {
        res.status(400).json({ error: 'Invalid family group code' });
        return;
      }

      familyGroupId = familyGroup.rows[0].id;
    }

    // Create user
    const result = await query(
      `INSERT INTO users (email, display_name, family_group_id) 
       VALUES ($1, $2, $3) 
       RETURNING id, email, display_name, total_points, level, family_group_id, created_at`,
      [email || null, display_name, familyGroupId]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = generateToken(user.id, user.email || `user_${user.id}`);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        total_points: user.total_points,
        level: user.level,
        family_group_id: user.family_group_id
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  try {
    // Find user by email
    const result = await query(
      `SELECT id, email, display_name, total_points, level, family_group_id 
       FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const user = result.rows[0];

    // Update last login
    await query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Generate JWT token
    const token = generateToken(user.id, user.email);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        total_points: user.total_points,
        level: user.level,
        family_group_id: user.family_group_id
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

/**
 * Refresh JWT token
 * POST /api/auth/refresh
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    
    // Get user
    const result = await query(
      'SELECT id, email FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = result.rows[0];

    // Generate new token
    const token = generateToken(user.id, user.email);

    res.json({
      success: true,
      token
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const result = await query(
      `SELECT 
        u.id, u.email, u.display_name, u.avatar_url, u.total_points, u.level,
        u.family_group_id, u.created_at, u.last_login,
        fg.name as family_group_name, fg.invite_code as family_invite_code,
        COUNT(DISTINCT ua.activity_id) as activities_completed,
        COUNT(DISTINCT ub.badge_id) as badges_earned
       FROM users u
       LEFT JOIN family_groups fg ON u.family_group_id = fg.id
       LEFT JOIN user_activities ua ON u.id = ua.user_id
       LEFT JOIN user_badges ub ON u.id = ub.user_id
       WHERE u.id = $1
       GROUP BY u.id, fg.id`,
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = result.rows[0];

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        total_points: user.total_points,
        level: user.level,
        family_group: user.family_group_id ? {
          id: user.family_group_id,
          name: user.family_group_name,
          invite_code: user.family_invite_code
        } : null,
        stats: {
          activities_completed: parseInt(user.activities_completed),
          badges_earned: parseInt(user.badges_earned)
        },
        created_at: user.created_at,
        last_login: user.last_login
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

