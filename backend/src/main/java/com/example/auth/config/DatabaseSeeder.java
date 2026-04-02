package com.example.auth.config;

import com.example.auth.model.*;
import com.example.auth.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
public class DatabaseSeeder {

    private static final String SLEEP_FORM_JSON = """
            {"genders":["Male","Female"],"occupations":["Software Engineer","Doctor","Sales Representative","Teacher","Scientist"],"bmiCategories":["Overweight","Normal","Obese"],"bloodPressures":["126/83","125/80","140/90","131/86"]}
            """.trim();

    @Bean
    @Profile("!test")
    CommandLineRunner seedDatabase(
            ActivityRepository activityRepo,
            OverviewStatRepository overviewStatRepo,
            OverviewTotalRepository overviewTotalRepo,
            WorkoutDistributionRepository workoutRepo,
            WellnessQuoteRepository quoteRepo,
            ConsultantRepository consultantRepo,
            PsychQuestionRepository psychRepo,
            YogaPoseRepository yogaRepo,
            ReferenceDataRepository referenceRepo,
            CommunityActivityRepository communityRepo
    ) {
        return args -> {
            if (activityRepo.count() == 0) {
                activityRepo.save(new Activity("Running", 70, "10 km", "7 km", 3, "Cardio"));
                activityRepo.save(new Activity("Swimming", 50, "20 laps", "10 laps", 5, "Cardio"));
                activityRepo.save(new Activity("Yoga", 90, "30 sessions", "27 sessions", 1, "Flexibility"));
            }

            if (overviewStatRepo.count() == 0) {
                overviewStatRepo.save(new OverviewStat("January", 10000));
                overviewStatRepo.save(new OverviewStat("February", 8500));
                overviewStatRepo.save(new OverviewStat("March", 9200));
                overviewStatRepo.save(new OverviewStat("April", 11000));
                overviewStatRepo.save(new OverviewStat("May", 9500));
            }

            if (overviewTotalRepo.count() == 0) {
                overviewTotalRepo.save(new OverviewTotal(60, 75, 85));
            }

            if (workoutRepo.count() == 0) {
                workoutRepo.save(new WorkoutDistribution("Cardio", 45));
                workoutRepo.save(new WorkoutDistribution("Strength", 35));
                workoutRepo.save(new WorkoutDistribution("Flexibility", 20));
            }

            if (quoteRepo.count() == 0) {
                int o = 0;
                quoteRepo.save(new WellnessQuote("A 30-minute walk a day keeps the doctor away.", "Exercise", o++));
                quoteRepo.save(new WellnessQuote("Eat more greens, your body will thank you.", "Healthy Food", o++));
                quoteRepo.save(new WellnessQuote("Hydration is the key to glowing skin.", "Wellness", o++));
                quoteRepo.save(new WellnessQuote("Sleep is the best meditation. – Dalai Lama", "Rest", o++));
                quoteRepo.save(new WellnessQuote("Stretching daily improves posture and reduces stress.", "Flexibility", o++));
                quoteRepo.save(new WellnessQuote("You are what you eat. Choose wisely.", "Nutrition", o++));
                quoteRepo.save(new WellnessQuote("Start your day with movement – it sparks productivity.", "Routine", o++));
                quoteRepo.save(new WellnessQuote("Taking deep breaths helps reduce anxiety.", "Mindfulness", o++));
                quoteRepo.save(new WellnessQuote("Strong body, strong mind.", "Fitness", o++));
                quoteRepo.save(new WellnessQuote("Rest and recovery are just as important as training.", "Recovery", o++));
                quoteRepo.save(new WellnessQuote("Sunlight and fresh air are underrated medicines.", "Natural Wellness", o++));
                quoteRepo.save(new WellnessQuote("Your health is an investment, not an expense.", "Motivation", o++));
                quoteRepo.save(new WellnessQuote("Progress, not perfection.", "Growth", o++));
                quoteRepo.save(new WellnessQuote("Make time for yourself. You're worth it.", "Self-Care", o++));
            }

            if (consultantRepo.count() == 0) {
                consultantRepo.save(new Consultant(
                        "Dr. Ananya Rao", "Psychiatrist", "MindCare Hospital", "Chennai",
                        "ananya@mindcare.com", "Mon–Fri, 10am–4pm",
                        "https://randomuser.me/api/portraits/women/44.jpg"));
                consultantRepo.save(new Consultant(
                        "Dr. Karthik Menon", "Nutritionist", "Wellness Life Center", "Bangalore",
                        "karthik@wellness.com", "Tue–Sat, 9am–2pm",
                        "https://randomuser.me/api/portraits/men/65.jpg"));
                consultantRepo.save(new Consultant(
                        "Dr. Priya Singh", "General Physician", "City Health Clinic", "Hyderabad",
                        "priya@cityhealth.com", "Mon–Sat, 11am–6pm",
                        "https://randomuser.me/api/portraits/women/68.jpg"));
            }

            if (psychRepo.count() == 0) {
                psychRepo.save(new PsychQuestion("How calm do you feel right now?", 0));
                psychRepo.save(new PsychQuestion("How much energy do you have?", 1));
                psychRepo.save(new PsychQuestion("How well did you sleep last night?", 2));
                psychRepo.save(new PsychQuestion("How stressed are you feeling today?", 3));
                psychRepo.save(new PsychQuestion("How easily can you focus right now?", 4));
                psychRepo.save(new PsychQuestion("How anxious have you been lately?", 5));
                psychRepo.save(new PsychQuestion("How emotionally balanced do you feel?", 6));
                psychRepo.save(new PsychQuestion("How motivated are you to take action today?", 7));
                psychRepo.save(new PsychQuestion("How socially connected do you feel?", 8));
                psychRepo.save(new PsychQuestion("How much mental clarity do you have right now?", 9));
            }

            if (yogaRepo.count() == 0) {
                yogaRepo.save(new YogaPose("1. Pranamasana (Prayer Pose)", "/wellness/yoga/step_1.jpg",
                        "Stand upright with feet together. Join your palms together in front of your chest.", 0));
                yogaRepo.save(new YogaPose("2. Hastauttanasana (Raised Arms Pose)", "/wellness/yoga/step_2.jpg",
                        "Inhale and lift your arms up and back, keeping the biceps close to your ears.", 1));
                yogaRepo.save(new YogaPose("3. Hasta Padasana (Hand to Foot Pose)", "/wellness/yoga/step_3.jpg",
                        "Exhale and bend forward from the waist. Try to touch the floor with your hands.", 2));
                yogaRepo.save(new YogaPose("4. Ashwa Sanchalanasana (Equestrian Pose)", "/wellness/yoga/step_4.jpg",
                        "Inhale and stretch your right leg back. Keep the left knee bent and look upward.", 3));
                yogaRepo.save(new YogaPose("5. Dandasana (Stick Pose)", "/wellness/yoga/step_5.jpg",
                        "Exhale and take your left leg back, bringing your body into a straight line (plank).", 4));
                yogaRepo.save(new YogaPose("6. Ashtanga Namaskara (Salute with Eight Parts)", "/wellness/yoga/step_6.jpg",
                        "Lower knees, chest, and chin to the floor. Hips stay up. Eight body parts touch the mat.", 5));
                yogaRepo.save(new YogaPose("7. Bhujangasana (Cobra Pose)", "/wellness/yoga/step_7.jpg",
                        "Inhale and slide forward to raise your chest in a gentle cobra pose.", 6));
                yogaRepo.save(new YogaPose("8. Adho Mukha Svanasana (Downward Dog)", "/wellness/yoga/step_8.jpg",
                        "Exhale and lift your hips to form an inverted V shape.", 7));
                yogaRepo.save(new YogaPose("9. Ashwa Sanchalanasana (Repeat Equestrian)", "/wellness/yoga/step_9.jpg",
                        "Inhale and bring your right foot forward. Keep the left leg back. Look up.", 8));
                yogaRepo.save(new YogaPose("10. Hasta Padasana (Repeat Hand to Foot)", "/wellness/yoga/step_10.jpg",
                        "Exhale and bring your left foot forward, folding from the waist.", 9));
                yogaRepo.save(new YogaPose("11. Hastauttanasana (Repeat Raised Arms)", "/wellness/yoga/step_11.jpg",
                        "Inhale and stretch your arms overhead and back gently.", 10));
                yogaRepo.save(new YogaPose("12. Pranamasana (Repeat Prayer Pose)", "/wellness/yoga/step_12.jpg",
                        "Exhale and stand upright. Bring your palms together in front of your chest.", 11));
            }

            if (referenceRepo.findById("sleep_prediction_form").isEmpty()) {
                referenceRepo.save(new ReferenceData("sleep_prediction_form", SLEEP_FORM_JSON));
            }

            if (communityRepo.count() == 0) {
                communityRepo.save(new CommunityActivity("Jane", "Skipping", "10 min ago",
                        "https://randomuser.me/api/portraits/women/65.jpg", 0));
                communityRepo.save(new CommunityActivity("Peter", "Slow jogging", "22 min ago",
                        "https://randomuser.me/api/portraits/men/32.jpg", 1));
                communityRepo.save(new CommunityActivity("John", "Hiking", "32 min ago",
                        "https://randomuser.me/api/portraits/men/52.jpg", 2));
                communityRepo.save(new CommunityActivity("Henry", "Quick sprint", "37 min ago",
                        "https://randomuser.me/api/portraits/men/41.jpg", 3));
            }
        };
    }
}
